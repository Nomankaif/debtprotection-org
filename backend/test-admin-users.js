const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_DEVELOPMENT_SECRET';

// Create a test JWT token for an admin user
const testToken = jwt.sign(
  { sub: '68ee09bf43fefcb30a7c1b0d' }, // Use the admin user ID from the database
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('Test token created');

// Test the admin/users endpoint
async function testAdminUsersEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5011,
      path: '/api/admin/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ Success!');
            console.log('Response status:', res.statusCode);
            console.log('Users returned:', parsedData.length);
            console.log('First user:', JSON.stringify(parsedData[0] || null, null, 2));
          } else {
            console.error('❌ Error:', res.statusCode, res.statusMessage);
            console.error('Error response:', JSON.stringify(parsedData, null, 2));
          }
          resolve();
        } catch (parseError) {
          console.error('❌ Parse error:', parseError.message);
          console.error('Raw response:', data);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      resolve();
    });

    req.setTimeout(5011, () => {
      console.error('❌ Request timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

testAdminUsersEndpoint();