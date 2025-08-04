const testConfig = {
  development: {
    clientUrl: 'http://localhost:5173',
    serverUrl: 'http://localhost:5000',
    apiUrl: 'http://localhost:5000/api'
  },
  production: {
    baseUrl: 'https://blog-web-app-ngmh.onrender.com',
    apiUrl: 'https://blog-web-app-ngmh.onrender.com/api'
  }
};

async function testEndpoint(url, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', data);
    } else {
      console.log('❌ Failed:', response.status, data);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API validation tests...\n');
  
  const env = process.argv[2] || 'production';
  const config = testConfig[env];
  
  if (!config) {
    console.log('❌ Invalid environment. Use: node test-api.js [development|production]');
    process.exit(1);
  }
  
  console.log(`🌍 Testing ${env} environment`);
  
  await testEndpoint(`${config.apiUrl || config.serverUrl + '/api'}/health`, 'Health Check');
  
  await testEndpoint(`${config.apiUrl || config.serverUrl + '/api'}/test`, 'API Test');
  
  console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
