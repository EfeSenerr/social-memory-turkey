import { Component } from "react";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as actions from "../../actions";

import SearchRow from "./atoms/SearchRow.jsx";

class Search extends Component {  constructor(props) {
    super(props);

    this.updateSearchQuery = this.updateSearchQuery.bind(this);
  }

  updateSearchQuery(e) {
    const queryString = e.target.value;
    this.props.actions.updateSearchQuery(queryString);
  }

  render() {
    let searchResults;

    const searchAttributes = ["description", "location", "category", "date"];    if (!this.props.queryString) {
      searchResults = [];
    } else {
      searchResults = this.props.events.filter((event) =>
        searchAttributes.some((attribute) => {
          const value = event[attribute];
          // Check if the value exists and is a string or can be converted to string
          if (value == null) return false;
          const stringValue = typeof value === 'string' ? value : String(value);
          return stringValue
            .toLowerCase()
            .includes(this.props.queryString.toLowerCase());
        })
      );
    }

    return (
      <div
        className={
          "search-outer-container" +
          (this.props.narrative ? " narrative-mode " : "")
        }      >        <div
          className={
            "search-bar-overlay" + (this.props.isFolded ? " folded" : "")
          }
        >
          <div className="search-input-container">
            <input
              className="search-bar-input"
              onChange={this.updateSearchQuery}
              type="text"
            />
            <i
              id="close-search-overlay"
              className="material-icons"
              onClick={this.props.onToggleSearch}
            >
              close
            </i>
          </div><div className="search-results">
            {searchResults.map((result, index) => {
              return (
                <SearchRow
                  key={result.id || index}
                  onSearchRowClick={this.props.onSearchRowClick}
                  eventObj={result}
                  query={this.props.queryString}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect((state) => state, mapDispatchToProps)(Search);
