const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// កំណត់ Headers ចាំបាច់សម្រាប់ WebAssembly & SharedArrayBuffer
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// ចង្អុលទៅកាន់ Folder "public"
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server កំពុងដំណើរការលើ Port: ${PORT}`);
});
