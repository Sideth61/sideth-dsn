const isoPicker = document.getElementById('isoPicker');
const statusText = document.getElementById('status');

isoPicker.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  statusText.innerText = `កំពុងដំណើរការ: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`;

  // បង្កើត Blob URL បណ្ដោះអាសន្នចេញពីឯកសារក្នុងម៉ាស៊ីន (មិនបាច់ upload ឡើង internet ទេ)
  const gameBlobUrl = URL.createObjectURL(file);

  // កំណត់ Parameters សម្រាប់ EmulatorJS
  window.EJS_player = '#game';
  window.EJS_core = 'psp';
  window.EJS_gameUrl = gameBlobUrl;
  window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';

  // ចាប់ផ្ដើមទាញយក script ដំណើរការហ្គេម
  const script = document.createElement('script');
  script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  document.body.appendChild(script);
});
