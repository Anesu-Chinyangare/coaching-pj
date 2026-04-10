const https = require('https');

const data = JSON.stringify({
  email: 'anesu6589@gmail.com',
  password: 'Admin1234!',
  email_confirm: true
});

const options = {
  hostname: 'cvflmervkyryoonkwron.supabase.co',
  path: '/auth/v1/admin/users',
  method: 'POST',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmxtZXJ2a3lyeW9vbmt3cm9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYyNzI3MCwiZXhwIjoyMDkxMjAzMjcwfQ.LwSTJpO6C8HDLS38p5gLymwKxZ1pmbYE9ayAsCurJ54',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmxtZXJ2a3lyeW9vbmt3cm9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYyNzI3MCwiZXhwIjoyMDkxMjAzMjcwfQ.LwSTJpO6C8HDLS38p5gLymwKxZ1pmbYE9ayAsCurJ54',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});

req.write(data);
req.end();