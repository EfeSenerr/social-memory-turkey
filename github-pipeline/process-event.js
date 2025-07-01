const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Process parsed event data and update JSON files
 */
class EventProcessor {
  constructor() {
    // Use public/data for local staging, but primary source is Azure Blob
    this.dataDir = path.join(process.cwd(), '../public/data');
    this.events = [];
    this.sources = {};
    this.associations = {};
    this.api = {};
    this.azureSourceUrl = 'https://stgsuhn5s3.blob.core.windows.net';
  }

  async loadExistingData() {
    try {
      // Try to load from Azure Blob first (production data)
      console.log('🌐 Attempting to load data from Azure Blob Storage...');
      
      try {
        // Load from Azure Blob (production data source)
        const apiData = await this.fetchFromAzure('/data/tr_api.json');
        
        if (apiData && apiData.events && apiData.sources && apiData.associations) {
          this.events = apiData.events;
          this.sources = apiData.sources;
          this.associations = apiData.associations;
          this.api = apiData;
          console.log('✅ Loaded data from Azure Blob Storage');
          return;
        }
      } catch (azureError) {
        console.log('⚠️  Azure Blob data not available, falling back to local files');
      }

      // Fallback to local files for development/testing
      console.log('📁 Loading from local files...');
      
      // Load existing events
      const eventsPath = path.join(this.dataDir, 'tr_events.json');
      if (fs.existsSync(eventsPath)) {
        this.events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
      }

      // Load existing sources
      const sourcesPath = path.join(this.dataDir, 'tr_sources.json');
      if (fs.existsSync(sourcesPath)) {
        this.sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
      }

      // Load existing associations
      const associationsPath = path.join(this.dataDir, 'tr_associations.json');
      if (fs.existsSync(associationsPath)) {
        this.associations = JSON.parse(fs.readFileSync(associationsPath, 'utf8'));
      }

      // Load existing API data
      const apiPath = path.join(this.dataDir, 'tr_api.json');
      if (fs.existsSync(apiPath)) {
        this.api = JSON.parse(fs.readFileSync(apiPath, 'utf8'));
      }
      
      console.log('✅ Loaded data from local files');
    } catch (error) {
      console.error('Error loading existing data:', error);
      throw error;
    }
  }

  async fetchFromAzure(endpoint) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const url = `${this.azureSourceUrl}${endpoint}`;
      
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  generateEventId() {
    // Find the highest existing ID number
    const existingIds = this.events
      .map(event => event.id)
      .filter(id => id.startsWith('TR_'))
      .map(id => parseInt(id.replace('TR_', '')))
      .filter(num => !isNaN(num));

    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return `TR_${String(maxId + 1).padStart(3, '0')}`;
  }

  generateSourceId(baseId) {
    let counter = 1;
    let sourceId = `${baseId}_src${counter}`;
    
    while (this.sources[sourceId]) {
      counter++;
      sourceId = `${baseId}_src${counter}`;
    }
    
    return sourceId;
  }

  processNewEvent(eventData) {
    const eventId = this.generateEventId();
    
    // Create source entries
    const sourceIds = [];
    if (eventData.sourcesList && eventData.sourcesList.length > 0) {
      eventData.sourcesList.forEach((sourceUrl, index) => {
        const sourceId = this.generateSourceId(eventId);
        sourceIds.push(sourceId);
        
        this.sources[sourceId] = {
          id: sourceId,
          paths: [sourceUrl],
          title: eventId,
          description: `Source ${index + 1} for ${eventData.title}`
        };
      });
    }

    // Create association if it doesn't exist
    const associationId = `tr_asc_${eventData.associationKey.toLowerCase()}`;
    if (!this.associations[associationId]) {
      this.associations[associationId] = {
        id: associationId,
        title: eventData.category,
        description: `Events related to ${eventData.category}`,
        mode: "DEFAULT"
      };
    }

    // Create event entry
    const newEvent = {
      sources: sourceIds,
      id: eventId,
      description: eventData.description,
      date: eventData.date,
      location: eventData.location,
      latitude: eventData.latitude || "",
      longitude: eventData.longitude || "",
      graphic: "FALSE",
      associations: [associationId],
      time: eventData.time || "",
      responsible_party: eventData.responsibleParty || "",
      impact: eventData.impact || ""
    };

    // Add images field if needed (empty for now)
    if (eventData.images) {
      newEvent.images = eventData.images;
    }

    this.events.push(newEvent);
    
    console.log(`Created new event: ${eventId}`);
    return eventId;
  }

  updateExistingEvent(eventData) {
    const eventIndex = this.events.findIndex(event => event.id === eventData.eventId);
    
    if (eventIndex === -1) {
      throw new Error(`Event ${eventData.eventId} not found`);
    }

    // For now, this is a simplified update - in production you'd want more sophisticated update logic
    console.log(`Would update event: ${eventData.eventId} with ${eventData.updateType}`);
    
    // Add a comment or note about the update
    const event = this.events[eventIndex];
    if (!event.update_notes) {
      event.update_notes = [];
    }
    
    event.update_notes.push({
      date: new Date().toISOString(),
      type: eventData.updateType,
      description: eventData.updateDescription
    });

    return eventData.eventId;
  }

  generateApiData() {
    // Generate the combined API data structure
    this.api = {
      events: this.events,
      sources: this.sources,
      associations: this.associations,
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalEvents: this.events.length,
        totalSources: Object.keys(this.sources).length,
        totalAssociations: Object.keys(this.associations).length
      }
    };
  }

  async saveData() {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      // Save all JSON files
      fs.writeFileSync(
        path.join(this.dataDir, 'tr_events.json'),
        JSON.stringify(this.events, null, 2)
      );

      fs.writeFileSync(
        path.join(this.dataDir, 'tr_sources.json'),
        JSON.stringify(this.sources, null, 2)
      );

      fs.writeFileSync(
        path.join(this.dataDir, 'tr_associations.json'),
        JSON.stringify(this.associations, null, 2)
      );

      fs.writeFileSync(
        path.join(this.dataDir, 'tr_api.json'),
        JSON.stringify(this.api, null, 2)
      );

      console.log('Data files saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    const eventDataStr = process.env.EVENT_DATA;
    const updateType = process.env.UPDATE_TYPE;
    
    if (!eventDataStr) {
      throw new Error('No event data provided');
    }

    const eventData = JSON.parse(eventDataStr);
    const processor = new EventProcessor();

    console.log('Loading existing data...');
    await processor.loadExistingData();

    let eventId;
    if (updateType === 'update') {
      console.log('Processing event update...');
      eventId = processor.updateExistingEvent(eventData);
    } else {
      console.log('Processing new event...');
      eventId = processor.processNewEvent(eventData);
    }

    console.log('Generating API data...');
    processor.generateApiData();

    console.log('Saving data files...');
    await processor.saveData();

    console.log(`Event processing completed: ${eventId}`);
  } catch (error) {
    console.error('Error processing event:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = EventProcessor;
