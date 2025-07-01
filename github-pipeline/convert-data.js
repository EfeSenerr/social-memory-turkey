const fs = require('fs');
const path = require('path');

/**
 * Convert existing data to match the new pipeline format
 */

console.log('🔄 Converting existing data to new format...');

const dataDir = path.join(__dirname, '../public/data');

// Read existing files
const events = JSON.parse(fs.readFileSync(path.join(dataDir, 'tr_events.json'), 'utf8'));
const sources = JSON.parse(fs.readFileSync(path.join(dataDir, 'tr_sources.json'), 'utf8'));
const associations = JSON.parse(fs.readFileSync(path.join(dataDir, 'tr_associations.json'), 'utf8'));
const apiData = JSON.parse(fs.readFileSync(path.join(dataDir, 'tr_api.json'), 'utf8'));

console.log('📊 Current data:');
console.log(`- Events: ${events.length}`);
console.log(`- Sources: ${Object.keys(sources).length}`);
console.log(`- Associations: ${associations.length}`);
console.log(`- API entries: ${apiData.length}`);

// Convert associations from array to object
const associationsObject = {};
associations.forEach(assoc => {
  associationsObject[assoc.id] = {
    id: assoc.id,
    title: assoc.title,
    description: assoc.desc || assoc.description || `Events related to ${assoc.title}`,
    mode: assoc.mode === 'FILTER' ? 'DEFAULT' : (assoc.mode || 'DEFAULT')
  };
});

// Create new API structure
const newApiData = {
  events: events,
  sources: sources,
  associations: associationsObject,
  metadata: {
    lastUpdated: new Date().toISOString(),
    totalEvents: events.length,
    totalSources: Object.keys(sources).length,
    totalAssociations: Object.keys(associationsObject).length
  }
};

// Create backup of original files
const backupDir = path.join(dataDir, 'backup_' + new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(backupDir, { recursive: true });

fs.copyFileSync(path.join(dataDir, 'tr_associations.json'), path.join(backupDir, 'tr_associations.json'));
fs.copyFileSync(path.join(dataDir, 'tr_api.json'), path.join(backupDir, 'tr_api.json'));

console.log(`📁 Backup created: ${backupDir}`);

// Write converted files
fs.writeFileSync(
  path.join(dataDir, 'tr_associations.json'),
  JSON.stringify(associationsObject, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'tr_api.json'),
  JSON.stringify(newApiData, null, 2)
);

console.log('✅ Data conversion completed!');
console.log('🔍 New structure:');
console.log(`- Associations: Object with ${Object.keys(associationsObject).length} entries`);
console.log('- API: Complete structure with events, sources, associations, and metadata');

console.log('\n🧪 Testing validation...');

// Test validation
const { execSync } = require('child_process');
try {
  execSync('node validate-json.js', { cwd: __dirname, stdio: 'inherit' });
  console.log('\n✅ Validation successful!');
} catch (error) {
  console.log('\n❌ Validation failed. Check output above.');
}
