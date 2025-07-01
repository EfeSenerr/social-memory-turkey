#!/usr/bin/env node

/**
 * Setup script for GitHub-based event management pipeline
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up GitHub Event Management Pipeline...\n');

// Check if required files exist
const requiredFiles = [
  '../.github/workflows/process-events.yml',
  '../.github/ISSUE_TEMPLATE/add-new-event.yml',
  './package.json',
  './parse-issue.js',
  './process-event.js',
  './validate-json.js',
  './upload-to-azure.js'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all pipeline files are in place.');
  process.exit(1);
}

console.log('\n📦 Installing dependencies...');
const { execSync } = require('child_process');

try {
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.log('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('\n🔍 Testing pipeline components...');

// Test JSON validation
try {
  console.log('Testing JSON validation...');
  execSync('node validate-json.js', { cwd: __dirname, stdio: 'pipe' });
  console.log('✅ JSON validation test passed');
} catch (error) {
  console.log('⚠️  JSON validation test failed (expected if no data files exist yet)');
}

console.log('\n✅ Pipeline setup completed!\n');

console.log('📋 Next steps:');
console.log('1. Configure GitHub repository secrets:');
console.log('   - AZURE_CLIENT_ID');
console.log('   - AZURE_CLIENT_SECRET'); 
console.log('   - AZURE_TENANT_ID');
console.log('   - AZURE_STORAGE_ACCOUNT');
console.log('   - AZURE_STORAGE_KEY');
console.log('');
console.log('2. Test the system:');
console.log('   - Create a new issue using the "Add New Event" template');
console.log('   - Check if GitHub Actions runs successfully');
console.log('   - Review the created Pull Request');
console.log('');
console.log('3. Documentation:');
console.log('   - Read ./README.md for detailed usage instructions');
console.log('   - Share the issue template with contributors');
console.log('');
console.log('🎉 Your GitHub-based event management pipeline is ready!');
