/**
 * DSN OS Hub — Worker
 * Game API + Telegram Notify + PS2 Auto Play Stream
 *
 * Required Cloudflare Worker Variables:
 *
 * SUPABASE_URL
 * SUPABASE_ANON_KEY
 * SUPABASE_STORAGE_BUCKET = ps2-games
 * BOT_TOK
 *
 * Routes:
 * GET  /api/games
 * GET  /api/ps2-games
 * GET  /api/ps2-stream?file=<storage-path>
 * POST /api/notify
 * GET  /api/health
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Range",
  "Access-Control-Expose-Headers":
    "Accept-Ranges, Content-Length, Content-Range, Content-Type, ETag"
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra
    }
  });
}

function normalizeBase(url) {
  return String(url || "").replace(/\/+$/, "");
}

/**
 * Supabase REST request
 */
async function supabaseREST(env, path, options = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY"
    );
  }

  const headers = new Headers(options.headers || {});

  headers.set("apikey", env.SUPABASE_ANON_KEY);
  headers.set(
    "Authorization",
    `Bearer ${env.SUPABASE_ANON_KEY}`
  );

  return fetch(
    `${normalizeBase(env.SUPABASE_URL)}${path}`,
    {
      ...options,
      headers
    }
  );
}

/**
 * ---------------------------------------------------------
 * /api/games
 * Existing DSN game database API
 * ---------------------------------------------------------
 */
async function getGames(request, env) {
  const response = await supabaseREST(
    env,
    "/rest/v1/games?select=*"
  );

  const text = await response.text();

  if (!response.ok) {
    return json(
      {
        error: "Supabase games request failed",
        status: response.status,
        details: text
      },
      response.status
    );
  }

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = [];
  }

  return json(data);
}

/**
 * ---------------------------------------------------------
 * PS2 Storage
 * ---------------------------------------------------------
 */

function getBucket(env) {
  return env.SUPABASE_STORAGE_BUCKET || "ps2-games";
}

function cleanFile(value) {
  try {
    const decoded = decodeURIComponent(value || "");

    return decoded
      .replace(/^\/+/, "")
      .replace(/\.\./g, "");
  } catch {
    return "";
  }
}

/**
 * Build Supabase Storage object URL.
 *
 * IMPORTANT:
 * We do NOT use HEAD.
 */
function storageObjectURL(env, file) {
  const base = normalizeBase(env.SUPABASE_URL);
  const bucket = encodeURIComponent(getBucket(env));

  const path = file
    .split("/")
    .filter(Boolean)
    .map(part => encodeURIComponent(part))
    .join("/");

  return `${base}/storage/v1/object/${bucket}/${path}`;
}

/**
 * ---------------------------------------------------------
 * List PS2 games
 * ---------------------------------------------------------
 */

async function listPS2Games(env) {
  const bucket = getBucket(env);

  const response = await supabaseREST(
    env,
    `/storage/v1/object/list/${encodeURIComponent(bucket)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prefix: "",
        limit: 1000,
        offset: 0,
        sortBy: {
          column: "name",
          order: "asc"
        }
      })
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Storage list failed: ${response.status} ${text}`
    );
  }

  let rows = [];

  try {
    rows = JSON.parse(text);
  } catch {
    rows = [];
  }

  if (!Array.isArray(rows)) {
    return [];
  }

  const supported = [
    "iso",
    "chd",
    "cso",
    "bin",
    "cue"
  ];

  const games = [];

  for (const row of rows) {
    /*
     * Supabase Storage folders can also appear in this result.
     * A real file normally has metadata.
     */
    if (!row || !row.metadata) {
      continue;
    }

    const name = String(row.name || "");

    const match = name.match(
      /\.([a-z0-9]+)$/i
    );

    if (!match) {
      continue;
    }

    const extension =
      match[1].toLowerCase();

    if (!supported.includes(extension)) {
      continue;
    }

    const title = name
      .replace(
        /\.(iso|chd|cso|bin|cue)$/i,
        ""
      )
      .replace(/[_-]+/g, " ")
      .trim();

    games.push({
      id: name,
      title: title || name,
      file: name,
      type: extension,
      size: Number(
        row.metadata?.size || 0
      ),

      /*
       * Library will use this URL.
       */
      stream:
        `/api/ps2-stream?file=${encodeURIComponent(
          name
        )}`
    });
  }

  games.sort(
    (a, b) =>
      a.title.localeCompare(
        b.title
      )
  );

  return games;
}

/**
 * ---------------------------------------------------------
 * PS2 Stream
 *
 * GET only
 * Range supported
 * NO HEAD
 * ---------------------------------------------------------
 */

async function streamPS2(request, env, url) {
  const file = cleanFile(
    url.searchParams.get("file")
  );

  if (!file) {
    return json(
      {
        ok: false,
        error: "Missing file parameter"
      },
      400
    );
  }

  const target =
    storageObjectURL(
      env,
      file
    );

  /*
   * IMPORTANT:
   * Only GET is sent to Supabase.
   */
  const headers = new Headers();

  headers.set(
    "apikey",
    env.SUPABASE_ANON_KEY
  );

  headers.set(
    "Authorization",
    `Bearer ${env.SUPABASE_ANON_KEY}`
  );

  /*
   * Forward Range from browser/emulator.
   */
  const range =
    request.headers.get("Range");

  if (range) {
    headers.set(
      "Range",
      range
    );
  }

  const upstream =
    await fetch(target, {
      method: "GET",
      headers,
      redirect: "follow"
    });

  /*
   * Do not convert a successful 206 into 200.
   */
  if (
    !upstream.ok &&
    upstream.status !== 206
  ) {
    const errorText =
      await upstream.text();

    return json(
      {
        ok: false,
        error:
          `PS2 stream failed: ${upstream.status}`,
        details: errorText,
        file
      },
      upstream.status
    );
  }

  const responseHeaders =
    new Headers(CORS_HEADERS);

  const forwardHeaders = [
    "Content-Type",
    "Content-Length",
    "Content-Range",
    "Accept-Ranges",
    "ETag",
    "Last-Modified"
  ];

  for (
    const header of forwardHeaders
  ) {
    const value =
      upstream.headers.get(
        header
      );

    if (value) {
      responseHeaders.set(
        header,
        value
      );
    }
  }

  responseHeaders.set(
    "Cache-Control",
    "public, max-age=3600"
  );

  responseHeaders.set(
    "Accept-Ranges",
    "bytes"
  );

  return new Response(
    upstream.body,
    {
      status: upstream.status,
      headers: responseHeaders
    }
  );
}

/**
 * ---------------------------------------------------------
 * Telegram
 * ---------------------------------------------------------
 */

async function notifyTelegram(
  request,
  env
) {
  if (!env.BOT_TOK) {
    return json(
      {
        success: false,
        error:
          "Missing BOT_TOK"
      },
      500
    );
  }

  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        success: false,
        error:
          "Invalid JSON body"
      },
      400
    );
  }

  const message =
    body.message ||
    "🎮 មានដំណឹងថ្មីពីប្រព័ន្ធ DSN-PS2!";

  const chatId =
    body.chat_id ||
    env.TELEGRAM_CHAT_ID;

  if (!chatId) {
    return json(
      {
        success: false,
        error:
          "Missing chat_id or TELEGRAM_CHAT_ID"
      },
      400
    );
  }

  const telegramURL =
    `https://api.telegram.org/bot${env.BOT_TOK}/sendMessage`;

  const response =
    await fetch(
      telegramURL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

  const result =
    await response.json();

  return json(
    {
      success:
        response.ok,
      result
    },
    response.ok
      ? 200
      : response.status
  );
}

/**
 * ---------------------------------------------------------
 * MAIN WORKER
 * ---------------------------------------------------------
 */

export default {
  async fetch(
    request,
    env,
    ctx
  ) {
    const url =
      new URL(request.url);

    /*
     * CORS preflight
     */
    if (
      request.method ===
      "OPTIONS"
    ) {
      return new Response(
        null,
        {
          status: 204,
          headers:
            CORS_HEADERS
        }
      );
    }

    try {
      /*
       * Health check
       */
      if (
        url.pathname ===
        "/api/health"
      ) {
        return json({
          ok: true,
          service:
            "DSN-PS2",
          time:
            new Date().toISOString()
        });
      }

      /*
       * Existing database games
       */
      if (
        url.pathname ===
        "/api/games" &&
        request.method === "GET"
      ) {
        return await getGames(
          request,
          env
        );
      }

      /*
       * PS2 Storage games
       */
      if (
        url.pathname ===
        "/api/ps2-games" &&
        request.method === "GET"
      ) {
        const games =
          await listPS2Games(
            env
          );

        return json({
          ok: true,
          count:
            games.length,
          games
        });
      }

      /*
       * PS2 streaming
       */
      if (
        url.pathname ===
        "/api/ps2-stream" &&
        request.method === "GET"
      ) {
        return await streamPS2(
          request,
          env,
          url
        );
      }

      /*
       * Telegram notification
       */
      if (
        url.pathname ===
        "/api/notify" &&
        request.method === "POST"
      ) {
        return await notifyTelegram(
          request,
          env
        );
      }

      /*
       * Default
       */
      return new Response(
        "Welcome to DSN-PS2 Gaming System by Sideth 🚀",
        {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "Content-Type":
              "text/plain; charset=utf-8"
          }
        }
      );

    } catch (err) {
      return json(
        {
          ok: false,
          error:
            err?.message ||
            String(err)
        },
        500
      );
    }
  }
};
