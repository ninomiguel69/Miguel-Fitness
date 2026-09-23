// Zero-dependency local development server for Miguel Fitness OS
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
    // Normalize URL
    let safeUrl = req.url.split('?')[0];
    if (safeUrl === '/' || safeUrl === '') {
        safeUrl = '/spa.html';
    }

    const filePath = path.normalize(path.join(ROOT, safeUrl));

    // Security check: prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Fallback to spa.html for SPA routing
            const spaPath = path.join(ROOT, 'spa.html');
            fs.readFile(spaPath, (spaErr, data) => {
                if (spaErr) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
                    res.end(data);
                }
            });
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, data) => {
            if (readErr) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            } else {
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache'
                });
                res.end(data);
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` MIGUEL.FIT // LOCAL DEV SERVER RUNNING`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` File: spa.html`);
    console.log(` Press Ctrl+C to stop the server`);
    console.log(`=========================================`);
});
