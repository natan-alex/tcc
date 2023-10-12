import http.server
import socketserver

PORT = 3000

Handler = http.server.SimpleHTTPRequestHandler

Handler.extensions_map={
    '.manifest': 'text/cache-manifest',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.css': 'text/css',
    '.wasm': 'application/wasm',
    '.js': 'application/x-javascript',
    '': 'application/octet-stream'
}

httpd = socketserver.TCPServer(("", PORT), Handler)

print("Serving at port", PORT)

httpd.serve_forever()
