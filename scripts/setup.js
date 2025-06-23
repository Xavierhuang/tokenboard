const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up BNB Crowdfunding Platform...\n');

// Check if .env exists
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExamplePath = path.join(__dirname, '../env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please edit it with your configuration.');
  } else {
    console.log('⚠️  env.example not found. Please create a .env file manually.');
  }
} else {
  console.log('✅ .env file already exists.');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '../node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing root dependencies...');
  console.log('   Run: npm install');
} else {
  console.log('✅ Root dependencies installed.');
}

// Check if frontend node_modules exists
const frontendNodeModulesPath = path.join(__dirname, '../frontend/node_modules');
if (!fs.existsSync(frontendNodeModulesPath)) {
  console.log('📦 Installing frontend dependencies...');
  console.log('   Run: cd frontend && npm install');
} else {
  console.log('✅ Frontend dependencies installed.');
}

console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your private key and RPC URLs');
console.log('2. Run: npm run compile');
console.log('3. Run: npm run deploy:testnet');
console.log('4. Update factory address in frontend/src/App.js');
console.log('5. Run: npm start');
console.log('\n🎉 Happy crowdfunding!'); 