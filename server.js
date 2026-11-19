const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
loadEnv(path.join(root, '.env'));
const port = Number(process.env.PORT || 3000);
const providers = [
  { id: 'gemini', name: 'Gemini', key: 'GEMINI_API_KEY', model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview' },
];

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

async function callProvider(provider, prompt) {
  if (provider.configurationError) {
    return { id: provider.id, name: provider.name, model: provider.label, error: provider.configurationError };
  }
  const key = process.env[provider.key];
  if (!key) return { id: provider.id, name: provider.name, model: provider.label || provider.model, error: 'API anahtarı ayarlanmamış. .env dosyasına ekleyin.' };
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent?key=${encodeURIComponent(key)}`;
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || data.message || `Servis hatası (${response.status})`);
    const answer = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n') || '';
    if (!answer) throw new Error('Servis boş yanıt döndürdü. Model ve anahtar ayarlarını kontrol edin.');
    return { id: provider.id, name: provider.name, model: provider.label || provider.model, answer };
  } catch (error) {
    return { id: provider.id, name: provider.name, model: provider.label || provider.model, error: error.name === 'TimeoutError' ? 'İstek zaman aşımına uğradı.' : error.message };
  }
}

function send(res, status, data, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/ask') {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 100_000) req.destroy(); });
    req.on('end', async () => {
      let payload;
      try { payload = JSON.parse(raw); } catch { return send(res, 400, { error: 'Geçersiz istek.' }); }
      const question = typeof payload.question === 'string' ? payload.question.trim() : '';
      if (!question) return send(res, 400, { error: 'Lütfen bir soru yazın.' });
      if (question.length > 20000) return send(res, 400, { error: 'Soru en fazla 20.000 karakter olabilir.' });
      const results = await Promise.all(providers.map(provider => callProvider(provider, question)));
      send(res, 200, { results });
    });
    return;
  }
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = pathname === '/' ? 'index.html' : path.basename(pathname);
  const allowed = new Set(['index.html', 'styles.css', 'app.js']);
  if (!allowed.has(file)) return send(res, 404, 'Bulunamadı', 'text/plain; charset=utf-8');
  fs.readFile(path.join(root, file), (error, data) => {
    if (error) return send(res, 404, 'Bulunamadı', 'text/plain; charset=utf-8');
    const type = file.endsWith('.css') ? 'text/css; charset=utf-8' : file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
    send(res, 200, data, type);
  });
});

server.listen(port, '127.0.0.1', () => console.log(`Üç Asistan hazır: http://localhost:${port}`));

