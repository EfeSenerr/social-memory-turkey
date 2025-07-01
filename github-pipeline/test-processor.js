// Test the event processor
const EventProcessor = require('./process-event.js');

console.log('🧪 Testing Event Processor...\n');

// Sample event data (what the parser would output)
const sampleEventData = {
  title: "Police intervention during student protest at Middle East Technical University",
  description: "Police forces used tear gas and water cannons to disperse peaceful student protesters who were demonstrating against tuition fee increases at METU campus in Ankara.",
  date: "01/15/2025",
  time: "14:30",
  location: "Middle East Technical University (METU), Ankara",
  coordinates: "39.8955, 32.7766",
  category: "Police Brutality",
  responsibleParty: "Ankara Police Department",
  impact: "15 students injured, 8 detained, classes suspended for the day",
  sources: "https://www.sozcu.com.tr/metu-police-intervention-2025\nhttps://twitter.com/metu_university/status/123456789\nhttps://bianet.org/english/education/metu-student-protest-2025",
  sourcesList: [
    "https://www.sozcu.com.tr/metu-police-intervention-2025",
    "https://twitter.com/metu_university/status/123456789",
    "https://bianet.org/english/education/metu-student-protest-2025"
  ],
  associationKey: "POLICE_BRUTALITY",
  latitude: "39.8955",
  longitude: "32.7766"
};

async function testEventProcessor() {
  try {
    const processor = new EventProcessor();
    
    console.log('📂 Loading existing data...');
    await processor.loadExistingData();
    
    console.log('📊 Current data state:');
    console.log(`- Events: ${processor.events.length}`);
    console.log(`- Sources: ${Object.keys(processor.sources).length}`);
    console.log(`- Associations: ${Object.keys(processor.associations).length}`);
    
    console.log('\n➕ Processing new event...');
    const eventId = processor.processNewEvent(sampleEventData);
    
    console.log(`✅ Created event: ${eventId}`);
    
    console.log('\n📊 Updated data state:');
    console.log(`- Events: ${processor.events.length}`);
    console.log(`- Sources: ${Object.keys(processor.sources).length}`);
    console.log(`- Associations: ${Object.keys(processor.associations).length}`);
    
    console.log('\n🔍 Generating API data...');
    processor.generateApiData();
    
    console.log('\n💾 Saving data (dry run - not actually saving)...');
    // Don't actually save to avoid modifying real data
    // await processor.saveData();
    
    console.log('✅ Event processing test completed successfully!');
    
    // Show the new event details
    const newEvent = processor.events.find(e => e.id === eventId);
    console.log('\n📋 New Event Details:');
    console.log(`- ID: ${newEvent.id}`);
    console.log(`- Date: ${newEvent.date}`);
    console.log(`- Location: ${newEvent.location}`);
    console.log(`- Sources: ${newEvent.sources.length} sources`);
    console.log(`- Associations: ${newEvent.associations.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error testing event processor:', error.message);
  }
}

testEventProcessor();
