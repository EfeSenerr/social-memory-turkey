const fs = require('fs');
const path = require('path');
const Joi = require('joi');

/**
 * Validate JSON files for correct structure and data integrity
 */
class DataValidator {
  constructor() {
    this.dataDir = path.join(process.cwd(), '../public/data');
    this.errors = [];
    this.warnings = [];
  }

  // Schema definitions
  getEventSchema() {
    return Joi.object({
      sources: Joi.array().items(Joi.string()).required(),
      id: Joi.string().pattern(/^TR_\d{3}$/).required(),
      description: Joi.string().min(10).required(),
      date: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required(),
      location: Joi.string().min(2).required(),
      latitude: Joi.alternatives().try(
        Joi.string().pattern(/^-?\d+\.?\d*$/),
        Joi.string().allow('')
      ).required(),
      longitude: Joi.alternatives().try(
        Joi.string().pattern(/^-?\d+\.?\d*$/),
        Joi.string().allow('')
      ).required(),
      graphic: Joi.string().valid('TRUE', 'FALSE').required(),
      associations: Joi.array().items(Joi.string()).required(),
      time: Joi.string().allow(''),
      responsible_party: Joi.string().allow(''),
      impact: Joi.string().allow(''),
      images: Joi.array().items(Joi.string()).optional(),
      update_notes: Joi.array().items(Joi.object({
        date: Joi.string().isoDate(),
        type: Joi.string(),
        description: Joi.string()
      })).optional()
    });
  }

  getSourceSchema() {
    return Joi.object().pattern(
      Joi.string(),
      Joi.object({
        id: Joi.string().required(),
        paths: Joi.array().items(Joi.string().uri().allow('HIDDEN')).required(),
        title: Joi.string().required(),
        description: Joi.string().required()
      })
    );
  }

  getAssociationSchema() {
    return Joi.object().pattern(
      Joi.string(),
      Joi.object({
        id: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        mode: Joi.string().valid('DEFAULT', 'CLUSTER').optional()
      })
    );
  }

  getApiSchema() {
    return Joi.object({
      events: Joi.array().items(this.getEventSchema()).required(),
      sources: this.getSourceSchema().required(),
      associations: this.getAssociationSchema().required(),
      metadata: Joi.object({
        lastUpdated: Joi.string().isoDate().required(),
        totalEvents: Joi.number().integer().min(0).required(),
        totalSources: Joi.number().integer().min(0).required(),
        totalAssociations: Joi.number().integer().min(0).required()
      }).required()
    });
  }

  validateJsonFile(filePath, schema, name) {
    try {
      if (!fs.existsSync(filePath)) {
        this.errors.push(`${name} file not found: ${filePath}`);
        return false;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const { error, warning } = schema.validate(data, { 
        allowUnknown: false,
        abortEarly: false 
      });

      if (error) {
        this.errors.push(`${name} validation errors:`);
        error.details.forEach(detail => {
          this.errors.push(`  - ${detail.path.join('.')}: ${detail.message}`);
        });
        return false;
      }

      console.log(`✅ ${name} validation passed`);
      return true;
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.errors.push(`${name} contains invalid JSON: ${error.message}`);
      } else {
        this.errors.push(`Error validating ${name}: ${error.message}`);
      }
      return false;
    }
  }

  validateDataIntegrity() {
    try {
      // Load all data
      const eventsPath = path.join(this.dataDir, 'tr_events.json');
      const sourcesPath = path.join(this.dataDir, 'tr_sources.json');
      const associationsPath = path.join(this.dataDir, 'tr_associations.json');

      if (!fs.existsSync(eventsPath) || !fs.existsSync(sourcesPath) || !fs.existsSync(associationsPath)) {
        this.errors.push('Cannot validate integrity: missing data files');
        return false;
      }

      const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
      const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
      const associations = JSON.parse(fs.readFileSync(associationsPath, 'utf8'));

      // Check for duplicate event IDs
      const eventIds = events.map(event => event.id);
      const duplicateEventIds = eventIds.filter((id, index) => eventIds.indexOf(id) !== index);
      if (duplicateEventIds.length > 0) {
        this.errors.push(`Duplicate event IDs found: ${duplicateEventIds.join(', ')}`);
      }

      // Check that all event sources exist
      events.forEach(event => {
        event.sources.forEach(sourceId => {
          if (!sources[sourceId]) {
            this.errors.push(`Event ${event.id} references non-existent source: ${sourceId}`);
          }
        });
      });

      // Check that all event associations exist
      events.forEach(event => {
        event.associations.forEach(associationId => {
          if (!associations[associationId]) {
            this.errors.push(`Event ${event.id} references non-existent association: ${associationId}`);
          }
        });
      });

      // Check for orphaned sources (sources not referenced by any event)
      const referencedSources = new Set();
      events.forEach(event => {
        event.sources.forEach(sourceId => referencedSources.add(sourceId));
      });

      Object.keys(sources).forEach(sourceId => {
        if (!referencedSources.has(sourceId) && sourceId !== 'tr_srcHidden') {
          this.warnings.push(`Orphaned source (not referenced by any event): ${sourceId}`);
        }
      });

      // Check for orphaned associations
      const referencedAssociations = new Set();
      events.forEach(event => {
        event.associations.forEach(assocId => referencedAssociations.add(assocId));
      });

      Object.keys(associations).forEach(assocId => {
        if (!referencedAssociations.has(assocId)) {
          this.warnings.push(`Orphaned association (not referenced by any event): ${assocId}`);
        }
      });

      // Validate date ranges
      const currentDate = new Date();
      events.forEach(event => {
        const eventDate = new Date(event.date);
        if (eventDate > currentDate) {
          this.warnings.push(`Event ${event.id} has future date: ${event.date}`);
        }
        
        const minDate = new Date('2013-01-01'); // Start of coverage
        if (eventDate < minDate) {
          this.warnings.push(`Event ${event.id} has date before coverage period: ${event.date}`);
        }
      });

      console.log(`✅ Data integrity validation completed`);
      if (this.warnings.length > 0) {
        console.log(`⚠️  Found ${this.warnings.length} warnings`);
      }
      
      return this.errors.length === 0;
    } catch (error) {
      this.errors.push(`Error during integrity validation: ${error.message}`);
      return false;
    }
  }

  async validate() {
    console.log('🔍 Starting data validation...');

    const eventSchema = this.getEventSchema();
    const sourceSchema = this.getSourceSchema();
    const associationSchema = this.getAssociationSchema();
    const apiSchema = this.getApiSchema();

    // Validate individual files
    const results = [
      this.validateJsonFile(
        path.join(this.dataDir, 'tr_events.json'),
        Joi.array().items(eventSchema),
        'Events'
      ),
      this.validateJsonFile(
        path.join(this.dataDir, 'tr_sources.json'),
        sourceSchema,
        'Sources'
      ),
      this.validateJsonFile(
        path.join(this.dataDir, 'tr_associations.json'),
        associationSchema,
        'Associations'
      ),
      this.validateJsonFile(
        path.join(this.dataDir, 'tr_api.json'),
        apiSchema,
        'API Data'
      )
    ];

    // Validate data integrity
    const integrityValid = this.validateDataIntegrity();
    results.push(integrityValid);

    const allValid = results.every(result => result === true);

    // Report results
    if (this.errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    if (allValid) {
      console.log('\n✅ All validations passed!');
    } else {
      console.log('\n❌ Validation failed. Please fix the errors above.');
    }

    return allValid;
  }
}

// Main execution
async function main() {
  const validator = new DataValidator();
  const isValid = await validator.validate();
  
  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Validation error:', error);
    process.exit(1);
  });
}

module.exports = DataValidator;
