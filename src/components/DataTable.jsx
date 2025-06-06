import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions';
import * as selectors from '../selectors';

class DataTable extends Component {    
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      sortField: 'date',
      sortDirection: 'desc',
      filters: {
        category: '',
        incidentType: '',
        location: '',
        verification: 'all'
      },
      expandedRows: new Set()
    };
  }

  componentDidMount() {
    this.updateBodyClass();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isVisible !== this.props.isVisible) {
      this.updateBodyClass();
    }
  }

  updateBodyClass = () => {
    if (this.props.isVisible) {
      document.body.classList.add('data-table-visible');
    } else {
      document.body.classList.remove('data-table-visible');
    }  };

  handleSearch = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleFilterChange = (filterType, value) => {
    this.setState({
      filters: {
        ...this.state.filters,
        [filterType]: value
      }
    });
  };

  handleSort = (field) => {
    const direction = this.state.sortField === field && this.state.sortDirection === 'asc' ? 'desc' : 'asc';
    this.setState({
      sortField: field,
      sortDirection: direction
    });
  };

  toggleRowExpansion = (eventId) => {
    const newExpandedRows = new Set(this.state.expandedRows);
    if (newExpandedRows.has(eventId)) {
      newExpandedRows.delete(eventId);
    } else {
      newExpandedRows.add(eventId);
    }
    this.setState({ expandedRows: newExpandedRows });
  };
  
  getFilteredAndSortedEvents = () => {
    const { events, sources, associations } = this.props.domain;
    const { searchTerm, sortField, sortDirection, filters } = this.state;

    // Debug log to see what data we're getting
    console.log('DataTable - Events:', events);
    console.log('DataTable - Sources:', sources);
    console.log('DataTable - Associations:', associations);

    if (!events || !Array.isArray(events)) {
      console.log('No events available or events is not an array');
      return [];
    }

    let filteredEvents = events.filter(event => {      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower) ||
          String(event.id || '').toLowerCase().includes(searchLower) ||
          event.responsible_party?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter (based on associations)
      if (filters.category && event.associations?.length > 0) {
        const eventCategories = event.associations.map(assocId => {
          const assoc = associations?.find(a => a.id === assocId);
          return assoc?.title;
        }).filter(Boolean);
        if (!eventCategories.some(cat => cat === filters.category)) return false;
      }

      // Location filter
      if (filters.location) {
        if (!event.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      }

      return true;
    });

    // Sort events
    filteredEvents.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'id':
          aValue = a.id || '';
          bValue = b.id || '';
          break;
        case 'location':
          aValue = a.location || '';
          bValue = b.location || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredEvents;
  };

  getEventCategory = (event) => {
    const { associations } = this.props.domain;
    if (!event.associations?.length || !associations) return 'Other';
    
    const assoc = associations.find(a => a.id === event.associations[0]);
    return assoc?.title || 'Other';
  };

  getEventSources = (event) => {
    const { sources } = this.props.domain;
    if (!event.sources?.length || !sources) return [];
    
    return event.sources.map(sourceId => sources[sourceId]).filter(Boolean);
  };

  getUniqueCategories = () => {
    const { associations } = this.props.domain;
    if (!associations) return [];
    return associations.map(assoc => assoc.title).filter(Boolean);
  };

  getUniqueLocations = () => {
    const { events } = this.props.domain;
    if (!events) return [];
    const locations = events.map(event => event.location).filter(Boolean);
    return [...new Set(locations)];
  };  
    render() {
    const { searchTerm, sortField, sortDirection, filters, expandedRows } = this.state;
    const { domain, isVisible } = this.props;
    
    // Debug information
    console.log('DataTable render - Domain:', domain);
    console.log('DataTable render - Events count:', domain?.events?.length || 0);
    
    const filteredEvents = this.getFilteredAndSortedEvents();
    const categories = this.getUniqueCategories();
    const locations = this.getUniqueLocations();    if (!isVisible) {
      return null;
    }

    return (
      <div className="data-table-container">        
        <div className="data-table-header">
          <h3>Events Data ({filteredEvents.length} events)</h3>
        </div>
        
        {/* Filters */}
        <div className="data-table-filters">
          <div className="filter-title">Filter by</div>
          <div className="filters-row">
            <div className="filter-group">
              <select 
                value={filters.category} 
                onChange={(e) => this.handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <select 
                value={filters.location} 
                onChange={(e) => this.handleFilterChange('location', e.target.value)}
                className="filter-select"
              >
                <option value="">Location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-section">
            <div className="filter-title">
              <label htmlFor="events-search">Search</label>
            </div>
            <input
              id="events-search"
              name="events-search"
              type="search"
              value={searchTerm}
              onChange={this.handleSearch}
              placeholder="Search events..."
              className="search-input"
            />
          </div>
        </div>

        <div className="results-message">
          Showing {filteredEvents.length} incidents
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th><span></span></th>
                <th>
                  <span 
                    className="sortable-header" 
                    onClick={() => this.handleSort('id')}
                  >
                    <span className="column-name">ID</span>
                    {sortField === 'id' && (
                      <span className="column-arrow">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
                <th>
                  <span 
                    className="sortable-header" 
                    onClick={() => this.handleSort('location')}
                  >
                    <span className="column-name">Location</span>
                    {sortField === 'location' && (
                      <span className="column-arrow">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
                <th>Category</th>
                <th>Responsible Party</th>
                <th>Lat</th>
                <th>Lon</th>
                <th>
                  <span 
                    className="sortable-header" 
                    onClick={() => this.handleSort('date')}
                  >
                    <span className="column-name">Date</span>
                    <span className="column-arrow">
                      {sortField === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </span>
                </th>
                <th>Impact</th>
                <th>Sources</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => {
                const isExpanded = expandedRows.has(event.id);
                const eventSources = this.getEventSources(event);
                const category = this.getEventCategory(event);
                
                return (
                  <React.Fragment key={event.id}>
                    <tr className={`event-row ${isExpanded ? 'expanded' : ''}`}>
                      <td className="row-toggle">
                        <span 
                          onClick={() => this.toggleRowExpansion(event.id)}
                          className="toggle-button"
                        >
                          {isExpanded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                              <path d="M0 256l384-224v448z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                              <path d="M384 256 0 32v448z"></path>
                            </svg>
                          )}
                        </span>
                      </td>
                      <td className="incident-id">{event.id}</td>
                      <td className="location">{event.location || '-'}</td>
                      <td className="category">{category}</td>
                      <td className="responsible-party">{event.responsible_party || '-'}</td>
                      <td className="lat">{event.latitude || '-'}</td>
                      <td className="lon">{event.longitude || '-'}</td>
                      <td className="date">{event.date || '-'}</td>
                      <td className="impact">{event.impact || '-'}</td>
                      <td className="sources">
                        {eventSources.map((source, index) => (
                          <span key={source.id}>
                            {source.paths && source.paths[0] !== 'HIDDEN' ? (
                              <a 
                                href={source.paths[0]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="source-link"
                              >
                                @{new URL(source.paths[0]).hostname}↗
                              </a>
                            ) : (
                              <span className="source-hidden">Source hidden</span>
                            )}
                            {index < eventSources.length - 1 && ', '}
                          </span>
                        ))}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="expanded-content">
                        <td colSpan="10">
                          <div className="event-details">
                            <h4>Event Details</h4>
                            <p><strong>Description:</strong> {event.description}</p>
                            {event.time && <p><strong>Time:</strong> {event.time}</p>}
                            {event.responsible_party && (
                              <p><strong>Responsible Party:</strong> {event.responsible_party}</p>
                            )}
                            {event.impact && <p><strong>Impact:</strong> {event.impact}</p>}
                            {eventSources.length > 0 && (
                              <div className="sources-detail">
                                <strong>Sources:</strong>
                                <ul>
                                  {eventSources.map(source => (
                                    <li key={source.id}>
                                      {source.paths && source.paths[0] !== 'HIDDEN' ? (
                                        <a 
                                          href={source.paths[0]} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                        >
                                          {source.description || source.title}
                                        </a>
                                      ) : (
                                        <span>{source.description || 'Source hidden for security reasons'}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  domain: selectors.getDomain(state),
  events: selectors.getEvents(state),
  sources: selectors.selectSources(state),
  associations: selectors.getAssociations(state)
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(DataTable);
