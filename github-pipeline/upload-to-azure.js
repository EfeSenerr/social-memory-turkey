const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

/**
 * Upload data files to Azure Blob Storage
 */
class AzureUploader {
  constructor() {
    this.storageAccount = process.env.AZURE_STORAGE_ACCOUNT;
    this.storageKey = process.env.AZURE_STORAGE_KEY;
    this.containerName = 'data';
    this.dataDir = path.join(process.cwd(), '../public/data');
    
    if (!this.storageAccount || !this.storageKey) {
      throw new Error('Azure storage credentials not provided');
    }

    // Create blob service client
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.storageAccount}.blob.core.windows.net`,
      {
        account: this.storageAccount,
        accountKey: this.storageKey
      }
    );
  }

  async uploadFile(localFilePath, blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      console.log(`Uploading ${blobName}...`);
      
      const fileData = fs.readFileSync(localFilePath);
      
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: 'application/json',
          blobCacheControl: 'public, max-age=300' // 5 minutes cache
        },
        metadata: {
          uploadedAt: new Date().toISOString(),
          source: 'github-pipeline'
        }
      };

      await blockBlobClient.upload(fileData, fileData.length, uploadOptions);
      
      console.log(`✅ Successfully uploaded ${blobName}`);
      return true;
    } catch (error) {
      console.error(`❌ Error uploading ${blobName}:`, error.message);
      return false;
    }
  }

  async uploadAllDataFiles() {
    const filesToUpload = [
      { local: 'tr_events.json', blob: 'tr_events.json' },
      { local: 'tr_sources.json', blob: 'tr_sources.json' },
      { local: 'tr_associations.json', blob: 'tr_associations.json' },
      { local: 'tr_api.json', blob: 'tr_api.json' }
    ];

    const results = [];

    for (const file of filesToUpload) {
      const localPath = path.join(this.dataDir, file.local);
      
      if (!fs.existsSync(localPath)) {
        console.log(`⚠️  File not found: ${localPath}`);
        results.push(false);
        continue;
      }

      const result = await this.uploadFile(localPath, file.blob);
      results.push(result);
    }

    return results;
  }

  async verifyUploads() {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      console.log('\n🔍 Verifying uploads...');
      
      const expectedFiles = ['tr_events.json', 'tr_sources.json', 'tr_associations.json', 'tr_api.json'];
      const verificationResults = [];

      for (const fileName of expectedFiles) {
        try {
          const blobClient = containerClient.getBlobClient(fileName);
          const properties = await blobClient.getProperties();
          
          console.log(`✅ ${fileName} - Size: ${properties.contentLength} bytes, Last Modified: ${properties.lastModified}`);
          verificationResults.push(true);
        } catch (error) {
          console.log(`❌ ${fileName} - Error: ${error.message}`);
          verificationResults.push(false);
        }
      }

      return verificationResults.every(result => result === true);
    } catch (error) {
      console.error('Error during verification:', error.message);
      return false;
    }
  }

  async ensureContainer() {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Check if container exists, create if it doesn't
      const exists = await containerClient.exists();
      if (!exists) {
        console.log(`Creating container: ${this.containerName}`);
        await containerClient.create({
          access: 'blob' // Public read access
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring container exists:', error.message);
      return false;
    }
  }

  async uploadWithRetry(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`\n🚀 Upload attempt ${attempt}/${maxRetries}`);
        
        // Ensure container exists
        const containerReady = await this.ensureContainer();
        if (!containerReady) {
          throw new Error('Failed to ensure container exists');
        }

        // Upload all files
        const uploadResults = await this.uploadAllDataFiles();
        const allUploaded = uploadResults.every(result => result === true);

        if (!allUploaded) {
          throw new Error('Some files failed to upload');
        }

        // Verify uploads
        const verified = await this.verifyUploads();
        if (!verified) {
          throw new Error('Upload verification failed');
        }

        console.log('\n🎉 All files uploaded and verified successfully!');
        return true;

      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          console.error('❌ All upload attempts failed');
          return false;
        }
        
        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${waitTime/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🔄 Starting Azure Blob Storage upload...');
    
    const uploader = new AzureUploader();
    const success = await uploader.uploadWithRetry();
    
    if (success) {
      console.log('\n✅ Upload completed successfully!');
      console.log('📍 Files are now available at: https://stgsuhn5s3.blob.core.windows.net/data/');
    } else {
      console.log('\n❌ Upload failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Upload error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AzureUploader;
