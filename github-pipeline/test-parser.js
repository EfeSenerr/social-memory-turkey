// Test the issue parser with sample data
const IssueParser = require('./parse-issue.js');

console.log('🧪 Testing Issue Parser...\n');

// Sample issue body (what GitHub would send)
const sampleIssueBody = `
### Event Title

Police intervention during student protest at Middle East Technical University

### Event Description

Police forces used tear gas and water cannons to disperse peaceful student protesters who were demonstrating against tuition fee increases at METU campus in Ankara.

### Date

01/15/2025

### Time

14:30

### Location

Middle East Technical University (METU), Ankara

### Coordinates

39.8955, 32.7766

### Primary Category

Police Brutality

### Responsible Party

Ankara Police Department

### Impact

15 students injured, 8 detained, classes suspended for the day

### Sources

https://www.sozcu.com.tr/metu-police-intervention-2025
https://twitter.com/metu_university/status/123456789
https://bianet.org/english/education/metu-student-protest-2025

### Additional Context

This incident occurred during ongoing protests against proposed tuition increases across Turkish universities.
`;

const sampleIssueTitle = '[EVENT] Police intervention at METU student protest';
const sampleIssueLabels = [{ name: 'new-event' }, { name: 'pending-review' }];

// Test the parser
const parser = new IssueParser(sampleIssueBody, sampleIssueTitle, sampleIssueLabels);
const result = parser.parse();

console.log('📊 Parse Result:');
console.log('Valid:', result.valid);

if (result.valid) {
  console.log('✅ Parsing successful!');
  console.log('\n📋 Extracted Data:');
  console.log('- Title:', result.eventData.title);
  console.log('- Date:', result.eventData.date);
  console.log('- Location:', result.eventData.location);
  console.log('- Category:', result.eventData.category);
  console.log('- Coordinates:', result.eventData.coordinates);
  console.log('- Sources count:', result.eventData.sourcesList?.length || 0);
  console.log('- Association key:', result.eventData.associationKey);
  
  console.log('\n🔄 Commit info:');
  console.log('- Type:', result.eventType);
  console.log('- Commit message:', result.commitMessage);
  console.log('- PR title:', result.prTitle);
} else {
  console.log('❌ Parsing failed!');
  console.log('Errors:', result.errors);
}

// Test update event parsing
console.log('\n\n🔄 Testing Update Event Parser...\n');

const updateIssueBody = `
### Event ID

TR_001

### Current Event Title

Police intervention during peaceful protest in Taksim Square

### Type of Update

Additional sources

### Description of Changes

Found additional video evidence and witness testimony from the incident. Adding new sources to strengthen documentation.

### New Sources (if applicable)

https://www.youtube.com/watch/additional-footage
https://twitter.com/witness_account/status/987654321
`;

const updateIssueTitle = '[UPDATE] TR_001 - Additional sources';
const updateIssueLabels = [{ name: 'update-event' }, { name: 'pending-review' }];

const updateParser = new IssueParser(updateIssueBody, updateIssueTitle, updateIssueLabels);
const updateResult = updateParser.parse();

console.log('📊 Update Parse Result:');
console.log('Valid:', updateResult.valid);

if (updateResult.valid) {
  console.log('✅ Update parsing successful!');
  console.log('\n📋 Update Data:');
  console.log('- Event ID:', updateResult.eventData.eventId);
  console.log('- Update Type:', updateResult.eventData.updateType);
  console.log('- Description:', updateResult.eventData.updateDescription);
} else {
  console.log('❌ Update parsing failed!');
  console.log('Errors:', updateResult.errors);
}

console.log('\n✅ Issue parser testing completed!');
