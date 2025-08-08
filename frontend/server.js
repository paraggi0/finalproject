const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;

// MIME types mapping
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Parse the URL
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    
    // Log the request
    console.log(`📝 Request: ${req.method} ${pathname}`);
    
    // Default to index.html if pathname is '/'
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Handle login redirect without .html extension
    if (pathname === '/pages/login') {
        pathname = '/pages/login.html';
    }
    
    // Handle API requests - redirect to backend server
    if (pathname.startsWith('/api/')) {
        console.log(`🔄 API request redirected: ${pathname}`);
        res.writeHead(302, { 
            'Location': `http://localhost:3001${pathname}`,
            'Access-Control-Allow-Origin': '*'
        });
        res.end();
        return;
    }
    
    // Handle favicon.ico
    if (pathname === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // Build the file path
    const filePath = path.join(__dirname, pathname);
    console.log(`📂 File path: ${filePath}`);
    
    // Get file extension
    const ext = path.extname(filePath);
    const mimeType = mimeTypes[ext] || 'text/plain';
    
    // Set no-cache headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`❌ File not found: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1><p>The requested file was not found.</p>');
            return;
        }
        
        console.log(`✅ File found: ${filePath}`);
        
        // Read and serve the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(`❌ Error reading file: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Internal Server Error</h1>');
                return;
            }
            
            console.log(`📤 Serving file: ${filePath} (${data.length} bytes)`);
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Frontend server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🌐 Access the application at: http://localhost:${PORT}/index.html`);
    console.log(`🔗 Login page: http://localhost:${PORT}/pages/login.html`);
});
