// DSN Google AI - Media Engine (media.js)
const DSNMedia = {
    generateImage: async function(prompt) {
        try {
            let res = await fetch('/api/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            let data = await res.json();
            return data.imageUrl || null;
        } catch (err) {
            console.error("Image Gen Error:", err);
            return null;
        }
    },

    generateVideo: async function(prompt) {
        try {
            let res = await fetch('/api/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            let data = await res.json();
            return data.videoUrl || null;
        } catch (err) {
            console.error("Video Gen Error:", err);
            return null;
        }
    }
};
