const fs = require('fs');
const path = require('path');

/**
 * Parse GitHub issue body and extract event data
 */
class IssueParser {
  constructor(issueBody, issueTitle, issueLabels) {
    this.issueBody = issueBody;
    this.issueTitle = issueTitle;
    this.issueLabels = issueLabels;
    this.eventData = {};
    this.errors = [];
  }

  parse() {
    try {
      // Determine if this is a new event or update
      const isUpdate = this.issueLabels.some(label => label.name === 'update-event');
      
      if (isUpdate) {
        return this.parseUpdateEvent();
      } else {
        return this.parseNewEvent();
      }
    } catch (error) {
      this.errors.push(`Parsing error: ${error.message}`);
      return { valid: false, errors: this.errors };
    }
  }

  parseNewEvent() {
    // Extract form data using regex patterns
    const extractField = (fieldName, required = false) => {
      const patterns = [
        new RegExp(`### ${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*?\\s*\\n\\s*([^\\n]+)`, 'i'),
        new RegExp(`\\*\\*${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*?:?\\s*\\*\\*\\s*([^\\n]+)`, 'i'),
        new RegExp(`${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*?:?\\s*([^\\n]+)`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = this.issueBody.match(pattern);
        if (match && match[1].trim() !== '') {
          return match[1].trim();
        }
      }
      
      if (required) {
        this.errors.push(`Missing required field: ${fieldName}`);
      }
      return null;
    };

    // Extract multi-line fields
    const extractMultilineField = (fieldName, required = false) => {
      const pattern = new RegExp(`### ${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*?\\s*\\n([\\s\\S]*?)(?=\\n###|\\n\\n|$)`, 'i');
      const match = this.issueBody.match(pattern);
      
      if (match && match[1].trim() !== '') {
        return match[1].trim();
      }
      
      if (required) {
        this.errors.push(`Missing required field: ${fieldName}`);
      }
      return null;
    };

    // Parse basic fields
    this.eventData.title = extractField('Event Title', true);
    this.eventData.description = extractMultilineField('Event Description', true);
    this.eventData.date = extractField('Date', true);
    this.eventData.time = extractField('Time', false);
    this.eventData.location = extractField('Location', true);
    this.eventData.coordinates = extractField('Coordinates', false);
    this.eventData.category = extractField('Primary Category', true);
    this.eventData.responsibleParty = extractField('Responsible Party', false);
    this.eventData.impact = extractMultilineField('Impact', false);
    this.eventData.sources = extractMultilineField('Sources', true);
    this.eventData.additionalContext = extractMultilineField('Additional Context', false);

    // Validate and process data
    this.validateEventData();
    this.processEventData();

    if (this.errors.length > 0) {
      return { valid: false, errors: this.errors };
    }

    return {
      valid: true,
      eventData: this.eventData,
      eventType: 'new',
      commitMessage: `Add new event: ${this.eventData.title}`,
      prTitle: `[EVENT] ${this.eventData.title}`,
      eventDate: this.eventData.date,
      eventLocation: this.eventData.location
    };
  }

  parseUpdateEvent() {
    // Implementation for update events
    const extractField = (fieldName, required = false) => {
      const pattern = new RegExp(`### ${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*?\\s*\\n\\s*([^\\n]+)`, 'i');
      const match = this.issueBody.match(pattern);
      
      if (match && match[1].trim() !== '') {
        return match[1].trim();
      }
      
      if (required) {
        this.errors.push(`Missing required field: ${fieldName}`);
      }
      return null;
    };

    this.eventData.eventId = extractField('Event ID', true);
    this.eventData.currentTitle = extractField('Current Event Title', true);
    this.eventData.updateType = extractField('Type of Update', true);
    this.eventData.updateDescription = extractField('Description of Changes', true);

    if (this.errors.length > 0) {
      return { valid: false, errors: this.errors };
    }

    return {
      valid: true,
      eventData: this.eventData,
      eventType: 'update',
      updateType: this.eventData.updateType,
      commitMessage: `Update event ${this.eventData.eventId}: ${this.eventData.updateType}`,
      prTitle: `[UPDATE] ${this.eventData.eventId} - ${this.eventData.updateType}`,
      eventDate: 'N/A',
      eventLocation: 'N/A'
    };
  }

  validateEventData() {
    // Validate date format (MM/DD/YYYY)
    if (this.eventData.date) {
      const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
      if (!datePattern.test(this.eventData.date)) {
        this.errors.push('Date must be in MM/DD/YYYY format');
      }
    }

    // Validate time format (HH:MM)
    if (this.eventData.time) {
      const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timePattern.test(this.eventData.time)) {
        this.errors.push('Time must be in HH:MM format (24-hour)');
      }
    }

    // Validate coordinates format
    if (this.eventData.coordinates) {
      const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
      if (!coordPattern.test(this.eventData.coordinates)) {
        this.errors.push('Coordinates must be in "latitude, longitude" format');
      }
    }

    // Validate category
    const validCategories = [
      'Government Oppression',
      'Police Brutality', 
      'Unjust Court Verdicts',
      'Media Censorship',
      'Suppression of Protests',
      'Human Rights Violations',
      'Other'
    ];
    
    if (this.eventData.category && !validCategories.includes(this.eventData.category)) {
      this.errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validate sources (should contain at least one URL)
    if (this.eventData.sources) {
      const urlPattern = /https?:\/\/[^\s]+/;
      if (!urlPattern.test(this.eventData.sources)) {
        this.errors.push('Sources must contain at least one valid URL');
      }
    }
  }

  processEventData() {
    // Process coordinates
    if (this.eventData.coordinates) {
      const [lat, lng] = this.eventData.coordinates.split(',').map(coord => coord.trim());
      this.eventData.latitude = lat;
      this.eventData.longitude = lng;
    } else {
      // Try to geocode location (simplified for now)
      this.eventData.latitude = null;
      this.eventData.longitude = null;
    }

    // Process sources into array
    if (this.eventData.sources) {
      this.eventData.sourcesList = this.eventData.sources
        .split('\n')
        .map(source => source.trim())
        .filter(source => source.length > 0);
    }

    // Map category to association
    const categoryMappings = {
      'Government Oppression': 'GOVT_OPPRESSION',
      'Police Brutality': 'POLICE_BRUTALITY',
      'Unjust Court Verdicts': 'UNJUST_VERDICTS',
      'Media Censorship': 'MEDIA_CENSORSHIP',
      'Suppression of Protests': 'PROTEST_SUPPRESSION',
      'Human Rights Violations': 'HUMAN_RIGHTS',
      'Other': 'OTHER'
    };

    this.eventData.associationKey = categoryMappings[this.eventData.category] || 'OTHER';
  }
}

// Main execution
async function main() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const issueBody = process.env.ISSUE_BODY;
  const issueTitle = process.env.ISSUE_TITLE;
  const issueLabels = JSON.parse(process.env.ISSUE_LABELS || '[]');

  console.log('Parsing issue:', issueNumber);

  const parser = new IssueParser(issueBody, issueTitle, issueLabels);
  const result = parser.parse();

  // Set GitHub Actions outputs
  console.log(`::set-output name=valid::${result.valid}`);
  
  if (result.valid) {
    console.log(`::set-output name=event-data::${JSON.stringify(result.eventData)}`);
    console.log(`::set-output name=event-type::${result.eventType}`);
    console.log(`::set-output name=update-type::${result.updateType || 'N/A'}`);
    console.log(`::set-output name=commit-message::${result.commitMessage}`);
    console.log(`::set-output name=pr-title::${result.prTitle}`);
    console.log(`::set-output name=event-date::${result.eventDate}`);
    console.log(`::set-output name=event-location::${result.eventLocation}`);
  } else {
    console.log(`::set-output name=error-message::${result.errors.join('; ')}`);
  }

  // Exit with appropriate code
  process.exit(result.valid ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error parsing issue:', error);
    console.log(`::set-output name=valid::false`);
    console.log(`::set-output name=error-message::${error.message}`);
    process.exit(1);
  });
}

module.exports = IssueParser;
