// Custom build script that doesn't use tracing
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create the output directory if it doesn't exist
const outputDir = path.join(__dirname, 'out');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy the public directory to the output directory
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  console.log('Copying public directory...');
  fs.cpSync(publicDir, path.join(outputDir, 'public'), { recursive: true });
}

// Create a simple index.html file
console.log('Creating index.html...');
fs.writeFileSync(path.join(outputDir, 'index.html'), `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ecom Store</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 800px;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    h1 {
      color: #e11d48;
    }
    p {
      margin-bottom: 1.5rem;
      color: #4b5563;
    }
    .button {
      display: inline-block;
      background-color: #e11d48;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      text-decoration: none;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #be123c;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Ecom Store</h1>
    <p>Welcome to our premium fabric store. We offer a wide range of high-quality fabrics for all your needs.</p>
    <a href="/products" class="button">Browse Products</a>
  </div>
</body>
</html>
`);

console.log('Build completed successfully!');
console.log(`Output directory: ${outputDir}`); 