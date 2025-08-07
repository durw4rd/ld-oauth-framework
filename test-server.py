from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

class OAuthHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/oauth/callback':
            # Read the request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            data = json.loads(post_data.decode('utf-8'))
            
            print("Received OAuth callback:")
            print("Access Token:", data.get('access_token', 'N/A'))
            print("Token Type:", data.get('token_type', 'N/A'))
            print("Expires In:", data.get('expires_in', 'N/A'))
            print("Session ID:", data.get('sessionId', 'N/A'))
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'success': True,
                'message': 'Access token received successfully',
                'token': data.get('access_token', '')
            }
            
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {'status': 'OK', 'message': 'OAuth test server is running'}
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>OAuth Test Server</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
                    .success { background: #d4edda; color: #155724; }
                    .info { background: #d1ecf1; color: #0c5460; }
                </style>
            </head>
            <body>
                <h1>OAuth Test Server</h1>
                <div class="status info">
                    <p>✅ Server is running on port 3000</p>
                    <p>Ready to receive OAuth callbacks from the framework</p>
                </div>
                <div id="token-info"></div>
            </body>
            </html>
            """
            
            self.wfile.write(html.encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('localhost', 3000), OAuthHandler)
    print("OAuth test server running at http://localhost:3000")
    print("Ready to receive OAuth callbacks from the framework")
    server.serve_forever()
