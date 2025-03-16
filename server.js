// Patch path.relative to handle undefined arguments
const originalPath = require('path');
const originalRelative = originalPath.relative;
originalPath.relative = function patchedRelative(from, to) {
  if (from === undefined || to === undefined) {
    console.warn('Warning: path.relative called with undefined arguments');
    return '';
  }
  return originalRelative(from, to);
};

// Import Next.js server
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Create custom directory for Next.js app
const customDir = path.join(__dirname, 'custom-next');
if (!fs.existsSync(customDir)) {
  fs.mkdirSync(customDir, { recursive: true });
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3004;

// Create the Next.js app with custom directory
const app = next({ 
  dev, 
  hostname, 
  port,
  dir: __dirname,
  conf: {
    distDir: 'custom-next',
    tracing: false,
    experimental: {
      outputFileTracing: false
    }
  }
});
const handle = app.getRequestHandler();

// Prepare the app and start the server
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 