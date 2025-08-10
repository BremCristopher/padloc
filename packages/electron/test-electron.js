#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create a simple test HTML file
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Padloc Electron Test</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 { margin: 0 0 1rem 0; }
        p { margin: 0.5rem 0; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Electron App Works!</h1>
        <p>Padloc Electron wrapper is functioning correctly.</p>
        <p>Node.js: <script>document.write(process.versions.node)</script></p>
        <p>Electron: <script>document.write(process.versions.electron)</script></p>
        <p>Chrome: <script>document.write(process.versions.chrome)</script></p>
    </div>
</body>
</html>
`;

// Save test HTML
const testHtmlPath = path.join(__dirname, 'app', 'test.html');
fs.writeFileSync(testHtmlPath, testHtml);

// Create a modified main.js that loads the test HTML
const mainJsPath = path.join(__dirname, 'app', 'main.js');
const mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Replace the loadURL line to load our test file
const modifiedMainJs = mainJs.replace(
    /win\.loadURL\([^)]+\)/,
    `win.loadFile('${testHtmlPath}')`
);

const testMainPath = path.join(__dirname, 'app', 'main-test.js');
fs.writeFileSync(testMainPath, modifiedMainJs);

console.log('Starting Electron with test page...');

// Start Electron with the test main file
const electron = spawn('npx', ['electron', testMainPath], {
    cwd: __dirname,
    stdio: 'inherit'
});

electron.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    // Clean up test files
    try {
        fs.unlinkSync(testHtmlPath);
        fs.unlinkSync(testMainPath);
    } catch (e) {}
});
