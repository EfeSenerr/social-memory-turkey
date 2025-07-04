import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../actions";
import * as selectors from "../selectors";
import config from "../../config";

import { Tabs, TabList, TabPanel } from "react-tabs";
import FilterListPanel from "./controls/FilterListPanel";
import CategoriesListPanel from "./controls/CategoriesListPanel";
import ShapesListPanel from "./controls/ShapesListPanel";
import BottomActions from "./controls/BottomActions";
import copy from "../common/data/copy.json";
import {
  trimAndEllipse,
  getImmediateFilterParent,
  getFilterSiblings,
  getFilterAncestors,
  addToColoringSet,
  removeFromColoringSet,
  mapCategoriesToPaths,
  getCategoryIdxs,
  getFilterIdx,
} from "../common/utilities";
import { ToolbarButton } from "./controls/atoms/ToolbarButton";
import { FullscreenToggle } from "./controls/FullScreenToggle";
import DownloadPanel from "./controls/DownloadPanel";

class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.onSelectFilter = this.onSelectFilter.bind(this);
    this.state = { _selected: 0, _active: false };
  }

  selectTab(selected) {
    let active = true;
    if (this.state._selected === selected && this.state._active === true) {
      active = false;
    }
    this.setState({ _selected: selected, _active: active });
  }

  onSelectFilter(key, matchingKeys) {
    const { filters, activeFilters, coloringSet, maxNumOfColors } = this.props;

    const parent = getImmediateFilterParent(key);
    const isTurningOff = activeFilters.includes(key);

    if (!isTurningOff) {
      const updatedColoringSet = addToColoringSet(coloringSet, matchingKeys);
      if (updatedColoringSet.length <= maxNumOfColors) {
        this.props.actions.updateColoringSet(updatedColoringSet);
      }
    } else {
      if (parent && activeFilters.includes(parent)) {
        const siblings = getFilterSiblings(filters, parent, key);
        let siblingsOff = true;
        for (const sibling of siblings) {
          if (activeFilters.includes(sibling)) {
            siblingsOff = false;
            break;
          }
        }

        if (siblingsOff) {
          const grandparentsOn = getFilterAncestors(key).filter((filt) =>
            activeFilters.includes(filt)
          );
          matchingKeys = matchingKeys.concat(grandparentsOn);
        }
      }

      const updatedColoringSet = removeFromColoringSet(
        coloringSet,
        matchingKeys
      );
      this.props.actions.updateColoringSet(updatedColoringSet);
    }
    this.props.methods.onSelectFilter(matchingKeys);
    this.props.actions.updateSelected([]);
  }

  renderClosePanel() {
    return (
      <div
        className="panel-header"
        onClick={() => this.selectTab(this.state._selected)}
      >
        <div className="caret" />
      </div>
    );
  }

  goToNarrative(narrative) {
    // this.selectTab(-1); // set all unselected within this component
    this.props.methods.onSelectNarrative(narrative);
  }

  renderToolbarNarrativePanel() {
    const { panels } = this.props.toolbarCopy;
    return (
      <TabPanel>
        <h2>{panels.narratives.label}</h2>
        <p>{panels.narratives.description}</p>
        {this.props.narratives.map((narr) => {
          return (
            <div className="panel-action action">
              <button
                onClick={() => {
                  this.goToNarrative(narr);
                }}
              >
                <p>{narr.id}</p>
                <p>
                  <small>{trimAndEllipse(narr.desc, 120)}</small>
                </p>
              </button>
            </div>
          );
        })}
      </TabPanel>
    );
  }

  renderToolbarCategoriesPanel() {
    const { categories: panelCategories } = this.props.toolbarCopy.panels;
    const catMap = mapCategoriesToPaths(
      this.props.categories,
      Object.keys(panelCategories)
    );

    return (
      <div>
        {Object.keys(catMap).map((type) => {
          const children = catMap[type];
          return (
            <TabPanel key={type}>
              <CategoriesListPanel
                categories={children}
                activeCategories={this.props.activeCategories}
                onCategoryFilter={this.props.methods.onCategoryFilter}
                language={this.props.language}
                title={panelCategories[type].label}
                description={panelCategories[type].description}
              />
            </TabPanel>
          );
        })}
      </div>
    );
  }

  renderToolbarFilterPanel() {
    const { panels } = this.props.toolbarCopy;
    return (
      <TabPanel>
        <FilterListPanel
          filters={this.props.filters}
          activeFilters={this.props.activeFilters}
          onSelectFilter={this.onSelectFilter}
          language={this.props.language}
          coloringSet={this.props.coloringSet}
          filterColors={this.props.filterColors}
          title={panels.filters.label}
          description={panels.filters.description}
        />
      </TabPanel>
    );
  }

  renderToolbarShapePanel() {
    const { panels } = this.props.toolbarCopy;

    if (this.props.features.USE_SHAPES) {
      return (
        <TabPanel>
          <ShapesListPanel
            shapes={this.props.shapes}
            activeShapes={this.props.activeShapes}
            onShapeFilter={this.props.methods.onShapeFilter}
            language={this.props.language}
            title={panels.shapes.label}
            description={panels.shapes.description}
          />
        </TabPanel>
      );
    }
  }

  renderToolbarDownloadPanel() {
    const { panels } = this.props.toolbarCopy;

    return (
      <TabPanel>
        <DownloadPanel
          language={this.props.language}
          title={panels.download.label}
          description={panels.download.description}
          domain={this.props.domain}
        />
      </TabPanel>
    );
  }

  renderToolbarTab(_selected, label, iconKey, key) {
    return (
      <ToolbarButton
        key={key}
        label={label}
        iconKey={iconKey}
        isActive={
          this.state._selected === _selected && this.state._active === true
        }
        onClick={() => {
          this.selectTab(_selected);
        }}
      />
    );
  }

  renderToolbarCategoryTabs(idxs) {
    const { categories: panelCategories } = this.props.toolbarCopy.panels;
    return (
      <div>
        {Object.keys(idxs).map((key) => {
          return this.renderToolbarTab(
            idxs[key],
            panelCategories[key].label,
            panelCategories[key].icon,
            key
          );
        })}
      </div>
    );
  }

  renderToolbarPanels() {
    const { features, narratives } = this.props;
    const classes =
      this.state._active === true ? "toolbar-panels" : "toolbar-panels folded";
    return (
      <div className={classes}>
        {this.renderClosePanel()}
        {narratives && narratives.length !== 0
          ? this.renderToolbarNarrativePanel()
          : null}
        {features.USE_CATEGORIES ? this.renderToolbarCategoriesPanel() : null}
        {features.USE_ASSOCIATIONS ? this.renderToolbarFilterPanel() : null}
        {features.USE_SHAPES ? this.renderToolbarShapePanel() : null}
        {features.USE_DOWNLOAD ? this.renderToolbarDownloadPanel() : null}
      </div>
    );
  }

  renderToolbarNavs() {
    if (this.props.narratives) {
      return this.props.narratives.map((nar, idx) => {
        const isActive =
          idx === this.state._selected && this.state._active === true;

        const classes = isActive ? "toolbar-tab active" : "toolbar-tab";

        return (
          <div
            className={classes}
            onClick={() => {
              this.selectTab(idx);
            }}
          >
            <div className="tab-caption">{nar.label}</div>
          </div>
        );
      });
    }
    return null;
  }

  renderToolbarTabs() {
    const { features, narratives, toolbarCopy } = this.props;
    const narrativesExist = narratives && narratives.length !== 0;
    let title = copy[this.props.language].toolbar.title;
    if (config.display_title) title = config.display_title;
    const { panels } = toolbarCopy;

    const narrativesIdx = 0;
    const categoryIdxs = getCategoryIdxs(
      Object.keys(panels.categories),
      narrativesExist ? 1 : 0
    );
    const numCategoryPanels = Object.keys(categoryIdxs).length;
    const filtersIdx = getFilterIdx(
      narrativesExist,
      features.USE_CATEGORIES,
      numCategoryPanels || 0
    );
    const shapesIdx = filtersIdx + features.USE_SHAPES;
    const downloadIdx = shapesIdx + features.USE_DOWNLOAD;

    return (
      <div className="toolbar">
        <div className="toolbar-header" onClick={this.props.methods.onTitle}>
          <p>{title}</p>
        </div>
        <div className="toolbar-tabs">
          <TabList>
            {narrativesExist
              ? this.renderToolbarTab(
                  narrativesIdx,
                  panels.narratives.label,
                  panels.narratives.icon
                )
              : null}
            {features.USE_CATEGORIES
              ? this.renderToolbarCategoryTabs(categoryIdxs)
              : null}
            {features.USE_ASSOCIATIONS
              ? this.renderToolbarTab(
                  filtersIdx,
                  panels.filters.label,
                  panels.filters.icon
                )
              : null}
            {features.USE_SHAPES
              ? this.renderToolbarTab(
                  shapesIdx,
                  panels.shapes.label,
                  panels.shapes.icon
                )
              : null}
            {features.USE_DOWNLOAD
              ? this.renderToolbarTab(
                  downloadIdx,
                  panels.download.label,
                  panels.download.icon
                )
              : null}            {features.USE_FULLSCREEN && (
              <FullscreenToggle language={this.props.language} />            )}
            {features.USE_SEARCH && (
              <ToolbarButton
                label="Search"
                iconKey="search"
                isActive={this.props.searchShowing}
                onClick={this.props.actions.toggleSearch}
              />
            )}            <ToolbarButton
              label="Show All Data"
              iconKey="table_chart"
              isActive={this.props.isDataTableVisible}
              onClick={this.props.methods.onToggleDataTable}
            />
          </TabList>
        </div>
        <BottomActions
          info={{
            enabled: this.props.infoShowing,
            toggle: this.props.actions.toggleInfoPopup,
          }}
          sites={{
            enabled: this.props.sitesShowing,
            toggle: this.props.actions.toggleSites,
          }}
          cover={{
            toggle: this.props.actions.toggleCover,
          }}
          features={this.props.features}
        />

        <div id="made-with">
          Made with{" "}
          <a href="https://github.com/forensic-architecture/timemap">TimeMap</a>
          <br />
          Free software from{" "}
          <a href="https://forensic-architecture.org">Forensic Architecture</a>
        </div>
      </div>
    );
  }

  render() {
    const { isNarrative } = this.props;

    return (
      <div
        id="toolbar-wrapper"
        className={`toolbar-wrapper ${isNarrative ? "narrative-mode" : ""}`}
      >
        <Tabs onSelect={() => null} selectedIndex={this.state._selected}>
          {this.renderToolbarTabs()}
          {this.renderToolbarPanels()}
        </Tabs>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    filters: selectors.getFilters(state),
    categories: selectors.getCategories(state),
    narratives: selectors.selectNarratives(state),
    shapes: selectors.getShapes(state),
    language: state.app.language,
    toolbarCopy: state.app.toolbar,
    activeFilters: selectors.getActiveFilters(state),
    activeCategories: selectors.getActiveCategories(state),
    activeShapes: selectors.getActiveShapes(state),
    viewFilters: state.app.associations.views,
    narrative: state.app.associations.narrative,
    sitesShowing: state.app.flags.isShowingSites,
    infoShowing: state.app.flags.isInfopopup,
    searchShowing: state.app.flags.isSearch,
    coloringSet: state.app.associations.coloringSet,
    maxNumOfColors: state.ui.coloring.maxNumOfColors,
    filterColors: state.ui.coloring.colors,
    eventRadius: state.ui.eventRadius,
    features: selectors.getFeatures(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
