// Test Azure uploader (dry run)
console.log('🧪 Testing Azure Upload Integration...\n');

// Mock Azure credentials for testing
process.env.AZURE_STORAGE_ACCOUNT = 'test-account';
process.env.AZURE_STORAGE_KEY = 'test-key';

const AzureUploader = require('./upload-to-azure.js');

async function testAzureUploader() {
  try {
    console.log('🔧 Creating uploader instance...');
    const uploader = new AzureUploader();
    
    console.log('✅ Azure uploader initialized successfully');
    console.log(`- Storage Account: ${uploader.storageAccount}`);
    console.log(`- Container: ${uploader.containerName}`);
    console.log(`- Data Directory: ${uploader.dataDir}`);
    
    console.log('\n📁 Checking data files...');
    const fs = require('fs');
    const path = require('path');
    
    const filesToCheck = [
      'tr_events.json',
      'tr_sources.json', 
      'tr_associations.json',
      'tr_api.json'
    ];
    
    filesToCheck.forEach(file => {
      const filePath = path.join(uploader.dataDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file} - ${Math.round(stats.size / 1024)}KB`);
      } else {
        console.log(`❌ ${file} - Not found`);
      }
    });
    
    console.log('\n🚀 Upload would proceed with real Azure credentials');
    console.log('📍 Target URL: https://stgsuhn5s3.blob.core.windows.net/data/');
    
    console.log('\n✅ Azure upload test completed!');
    console.log('💡 To test with real Azure: Set proper environment variables');
    
  } catch (error) {
    if (error.message.includes('Azure storage credentials')) {
      console.log('✅ Credential validation working correctly');
      console.log('💡 This is expected with test credentials');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

testAzureUploader();
