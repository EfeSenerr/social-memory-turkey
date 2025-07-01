# GitHub-Based Event Management Pipeline

This directory contains the GitHub-based pipeline for managing events in the Social Memory Turkey database. The system uses GitHub Issues as a user-friendly interface for submitting new events and updates.

## 🎯 How It Works

1. **User submits event** → GitHub Issue with structured form
2. **Automation validates** → Parses and validates the submission
3. **Creates Pull Request** → Generates PR with updated JSON files
4. **Manual review** → Maintainers review and approve
5. **Auto-deployment** → Merges to main branch and syncs to Azure Blob Storage

## 📁 Files Overview

- `parse-issue.js` - Parses GitHub issue forms and extracts event data
- `process-event.js` - Processes events and updates JSON files
- `validate-json.js` - Validates JSON structure and data integrity
- `upload-to-azure.js` - Uploads data files to Azure Blob Storage
- `package.json` - Node.js dependencies

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd github-pipeline
npm install
```

### 2. Configure GitHub Secrets

In your repository settings, add these secrets:

```
AZURE_CLIENT_ID=your-azure-service-principal-id
AZURE_CLIENT_SECRET=your-azure-service-principal-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_STORAGE_ACCOUNT=your-storage-account-name
AZURE_STORAGE_KEY=your-storage-account-key
```

### 3. Test Locally (Optional)

```bash
# Test data validation
npm run test

# Test individual components
node validate-json.js
node upload-to-azure.js
```

## 📝 Usage

### For Contributors

1. Go to your repository's Issues tab
2. Click "New Issue"
3. Select "📝 Add New Event" template
4. Fill out the form completely
5. Submit the issue
6. Wait for automated processing and review

### For Maintainers

1. Review incoming event issues
2. Check the automatically created Pull Requests
3. Verify event details and sources
4. Approve and merge PRs to publish events
5. Events automatically sync to Azure Blob Storage

## 🔧 Validation Rules

### Event Data Requirements

- **Date**: Must be in MM/DD/YYYY format
- **Time**: Must be in HH:MM format (24-hour) if provided
- **Location**: Required, minimum 2 characters
- **Sources**: Must contain at least one valid URL
- **Category**: Must be one of the predefined categories
- **Coordinates**: Must be in "latitude, longitude" format if provided

### Data Integrity Checks

- No duplicate event IDs
- All referenced sources exist
- All referenced associations exist
- Event dates within reasonable range
- Valid JSON structure

## 🏗️ Architecture

```
GitHub Issue (User Input)
    ↓
GitHub Actions Workflow
    ↓
parse-issue.js (Extract & Validate)
    ↓
process-event.js (Update JSON Files)
    ↓
validate-json.js (Verify Integrity)
    ↓
Create Pull Request (For Review)
    ↓
Manual Approval & Merge
    ↓
upload-to-azure.js (Deploy to Blob Storage)
    ↓
Live on Platform
```

## 🎨 Customization

### Adding New Event Categories

1. Update the category list in `parse-issue.js`
2. Update the form template in `.github/ISSUE_TEMPLATE/add-new-event.yml`
3. Update the mapping in `process-event.js`
4. Update your main application config

### Modifying Validation Rules

Edit the schemas in `validate-json.js` to change validation requirements.

### Changing Azure Configuration

Update the Azure connection settings in `upload-to-azure.js` and the workflow file.

## 🐛 Troubleshooting

### Common Issues

1. **"Validation Error"** → Check issue format and required fields
2. **"Azure Upload Failed"** → Verify Azure credentials and permissions
3. **"PR Creation Failed"** → Check GitHub token permissions
4. **"JSON Invalid"** → Run local validation to identify issues

### Debugging

```bash
# Check JSON validity
node validate-json.js

# Test parsing (requires environment variables)
ISSUE_BODY="test content" node parse-issue.js

# Test Azure connection
node upload-to-azure.js
```

### Logs

- GitHub Actions logs: Repository → Actions tab
- Azure Blob logs: Azure Portal → Storage Account → Monitoring

## 🔒 Security Notes

- Issue content is public - don't include sensitive information
- Azure credentials are stored as GitHub secrets
- All uploads are logged with metadata
- Manual review required before publishing

## 📊 Monitoring

The system provides:
- Automated validation reports
- Upload success/failure notifications
- Data integrity warnings
- Processing timeline tracking

## 🤝 Contributing

To improve the pipeline:

1. Test changes locally first
2. Update documentation for any new features
3. Ensure backward compatibility
4. Add validation for new fields

## 📞 Support

For pipeline issues:
1. Check GitHub Actions logs
2. Review validation error messages
3. Test components individually
4. Create issue with "bug" label if needed
