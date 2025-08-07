const express = require('express');
const app = express();
const port = 3000;

// Parse JSON bodies
app.use(express.json());

// Serve static files (for the template)
app.use(express.static('.'));

// OAuth callback endpoint
app.post('/oauth/callback', (req, res) => {
  console.log('Received OAuth callback:');
  console.log('Access Token:', req.body.access_token);
  console.log('Token Type:', req.body.token_type);
  console.log('Expires In:', req.body.expires_in);
  console.log('Session ID:', req.body.sessionId);
  
  // Store token in localStorage equivalent (for demo purposes)
  // In a real app, you'd store this securely
  
  res.json({ 
    success: true, 
    message: 'Access token received successfully',
    token: req.body.access_token 
  });
});

// Test endpoint to check if server is running
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'OAuth test server is running' });
});

// Simple HTML page to test the flow
app.get('/', (req, res) => {
  res.send(`
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
        <script>
            // Check for any stored token
            const token = localStorage.getItem('ld_access_token');
            if (token) {
                document.getElementById('token-info').innerHTML = 
                    '<div class="status success"><p>✅ Access token received: ' + token.substring(0, 20) + '...</p></div>';
            }
        </script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`OAuth test server running at http://localhost:${port}`);
  console.log('Ready to receive OAuth callbacks from the framework');
});
