# 🔧 Azure Credentials Setup Guide

## 📋 **Required GitHub Secrets**

To complete the pipeline setup, you need to add these secrets to your GitHub repository:

### **Step 1: Get Azure Credentials**

1. **Azure Service Principal** (for GitHub Actions)
   ```bash
   # Run this in Azure CLI
   az ad sp create-for-rbac --name "social-memory-turkey-github" --role contributor
   ```

2. **Azure Storage Account** (your existing blob storage)
   - Account name: `stgsuhn5s3` (from your config)
   - Get the access key from Azure Portal

### **Step 2: Add GitHub Secrets**

Go to: `https://github.com/EfeSenerr/social-memory-turkey/settings/secrets/actions`

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AZURE_CLIENT_ID` | `xxx-xxx-xxx` | Service Principal App ID |
| `AZURE_CLIENT_SECRET` | `xxx-xxx-xxx` | Service Principal Password |
| `AZURE_TENANT_ID` | `xxx-xxx-xxx` | Your Azure Tenant ID |
| `AZURE_STORAGE_ACCOUNT` | `stgsuhn5s3` | Your storage account name |
| `AZURE_STORAGE_KEY` | `xxx-xxx-xxx` | Storage account access key |

### **Step 3: Test the Pipeline**

1. **Create a test issue**:
   - Go to: https://github.com/EfeSenerr/social-memory-turkey/issues
   - Click "New issue"
   - Select "📝 Add New Event"
   - Fill out the form with test data

2. **Watch GitHub Actions**:
   - Go to: https://github.com/EfeSenerr/social-memory-turkey/actions
   - Check if the workflow runs successfully

3. **Review the Pull Request**:
   - A PR should be created automatically
   - Review and merge to publish to Azure Blob

## 🎯 **Architecture Summary**

### **Data Flow** (You're absolutely right!)
```
GitHub Issue → Pipeline → Azure Blob Storage → Live Platform
```

### **Local Files vs Azure Blob**
- **`public/data/`**: Only for development and pipeline staging
- **Azure Blob**: The real production database your platform reads from
- **GitHub Pipeline**: Manages updates to Azure Blob

### **Why This is Better**
✅ **Scalable**: Azure Blob handles any amount of data
✅ **Fast**: Global CDN for quick loading
✅ **Reliable**: Enterprise-grade storage
✅ **Clean Git**: No database files in version control
✅ **Easy Management**: User-friendly GitHub Issues interface

## 🔧 **Getting Azure Credentials**

### **Option 1: Azure CLI** (Recommended)
```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac --name "social-memory-turkey-github" \
  --role "Storage Blob Data Contributor" \
  --scopes "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP"

# Get storage account key
az storage account keys list --account-name stgsuhn5s3 --resource-group YOUR_RESOURCE_GROUP
```

### **Option 2: Azure Portal**
1. Go to Azure Active Directory → App registrations
2. Create new registration for "social-memory-turkey-github"
3. Create client secret
4. Assign "Storage Blob Data Contributor" role to storage account
5. Get storage account access key from "Access keys" section

## 🧪 **Test Commands**

After setting up secrets, test locally:

```bash
cd github-pipeline

# Test with your Azure credentials
$env:AZURE_STORAGE_ACCOUNT="stgsuhn5s3"
$env:AZURE_STORAGE_KEY="your-key-here"
node upload-to-azure.js
```

## 🎉 **Once Setup is Complete**

1. **Contributors can submit events** via GitHub Issues
2. **You review** the automatically created Pull Requests  
3. **Merge approval** publishes to Azure Blob Storage
4. **Platform updates** automatically from Azure Blob
5. **Zero manual database management** needed!

---

Your insight about Azure Blob being the primary database is spot on! This gives you a proper cloud-native architecture. 🚀
