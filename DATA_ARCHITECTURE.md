# 📊 Social Memory Turkey - Data Architecture

## 🏗️ **Database Strategy**

### **Production Data Source: Azure Blob Storage** 
- **URL**: `https://stgsuhn5s3.blob.core.windows.net/data/`
- **Purpose**: Live database for the platform
- **Files**: 
  - `tr_events.json` - All events
  - `tr_sources.json` - Source references
  - `tr_associations.json` - Category associations
  - `tr_api.json` - Combined API data

### **Local Files: Development/Staging Only**
- **Location**: `public/data/`
- **Purpose**: Local testing and pipeline staging
- **Status**: `.gitignore`d (not committed to repository)
- **Note**: Used by pipeline for processing before Azure upload

## 🔄 **Data Flow**

```
GitHub Issue Form
       ↓
   Pipeline Processing
       ↓
   Local Staging (public/data/)
       ↓
   Validation & Review
       ↓
   Azure Blob Upload
       ↓
   Live Platform Update
```

## 🎯 **Why This Architecture?**

1. **Azure Blob = Production Database**
   - ✅ Scalable and reliable
   - ✅ Fast global CDN
   - ✅ Easy to manage
   - ✅ Cost-effective

2. **Local Files = Development/Staging**
   - ✅ Fast local testing
   - ✅ Pipeline staging area
   - ✅ Git repository stays clean
   - ✅ No database commits to version control

3. **GitHub Pipeline = Management Interface**
   - ✅ User-friendly issue forms
   - ✅ Review process with Pull Requests
   - ✅ Automated validation
   - ✅ Version-controlled changes

## 🚀 **For Contributors**

- Submit events via GitHub Issues
- No need to worry about technical details
- Azure Blob updates happen automatically
- Changes go live after review approval

## 🔧 **For Developers**

- Local `public/data/` for testing only
- Real data comes from Azure Blob
- Pipeline handles Azure synchronization
- Use `npm run dev` for local development

## 📊 **Current Status**

- **Local Data**: 10 events (testing/staging)
- **Azure Blob**: Production database
- **Pipeline**: ✅ Ready for use
- **Platform**: Reads from Azure Blob

---

This ensures your database is properly cloud-hosted while maintaining an easy contribution workflow! 🇹🇷
