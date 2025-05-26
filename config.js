const one_day = 1440;

const config = {
  title: "turkey",
  display_title: "Social Memory\nTurkey",
  SERVER_ROOT: ".", // TODO: Update with actual data source when available
  EVENTS_EXT: "/data/tr_events.json", // TODO: Update with actual data source when available
  SOURCES_EXT: "/data/tr_sources.json", // TODO: Update with actual data source when available
  ASSOCIATIONS_EXT: "/data/tr_associations.json", // TODO: Update with actual data source when available
  API_DATA: "/data/tr_api.json", // TODO: Update with actual data API endpoint when available
  MAPBOX_TOKEN:
    "pk.eyJ1IjoiYmVsbGluZ2NhdC1tYXBib3giLCJhIjoiY2tleW0wbWliMDA1cTJ5bzdkbTRraHgwZSJ9.GJQkjPzj8554VhR5SPsfJg",
  // MEDIA_EXT: "/api/media",
  DATE_FMT: "M/D/YYYY",
  TIME_FMT: "HH:mm",

  store: {
    app: {
      debug: true,
      map: {
        // anchor: [49.02421913, 31.43836003],
        anchor: [38.9637, 35.2433], // Coordinates for Turkey's center
        maxZoom: 18,
        minZoom: 4,
        startZoom: 6,
        // maxBounds: []
      },
      cluster: { radius: 50, minZoom: 5, maxZoom: 12 },
      associations: {
        defaultCategory: "Weapon System",
      },
      timeline: {
        dimensions: {
          height: 90,
          contentHeight: 90,
        },
        zoomLevels: [
          // { label: "Zoom to 2 weeks", duration: 14 * one_day },
          { label: "Zoom to 1 month", duration: 31 * one_day },
          { label: "Zoom to 6 months", duration: 6 * 31 * one_day },
          { label: "Zoom to 1 year", duration: 12 * 31 * one_day },
          { label: "Zoom to 2 years", duration: 24 * 31 * one_day },
        ],
        range: {
          /**
           * Initial date range shown on map load.
           * Use [start, end] (strings in ISO 8601 format) for a fixed range.
           * Use undefined for a dynamic initial range based on the browser time.
           */
          initial: undefined,
          /** The number of days to show when using a dynamic initial range */
          initialDaysShown: 31,
          limits: {
            /** Required. The lower bound of the range that can be accessed on the map. (ISO 8601) */
            lower: "2013-05-01T00:00:00.000Z", // Starting with Gezi Park protests in 2013
            /**
             * The upper bound of the range that can be accessed on the map.
             * Defaults to current browser time if undefined.
             */
            upper: undefined,
          },
        },
      },
      intro: [
        '<!-- TODO: Replace with Turkey-related images -->\n<div class="two-columns"><div class="two-columns_column"><figure><img style="width: 100%; display:block;" src="" frameborder="0"><figcaption>Image: Placeholder</figcaption></figure></div><div class="two-columns_column"><figure><img style="width: 100%; display:block;" src="" frameborder="0"><figcaption>Image: Placeholder</figcaption></figure></div></div>',
        'This map documents significant social and political events in Turkey related to civil liberties, government actions, and human rights concerns. It includes incidents of government oppression, police brutality, unjust court verdicts, media censorship, suppression of protests, and other human rights violations. The platform serves as a historical record and advocacy tool, chronicling major events and issues affecting Turkish society. Users can explore incidents by date and location. This is intended as a living document that will continue to be updated as new incidents occur.',
        '<p><b>Note</b>: This project is a work in progress and more events will be added as they are verified and documented.</p>',
      ],

      flags: { isInfopoup: false, isCover: false },
      cover: {
        title: "About and Methodology",
        exploreButton: "BACK TO THE PLATFORM",
        description: [
          "## Scope of Research",
          "This database, organised on Forensic Architecture's [TimeMap](https://github.com/forensic-architecture/timemap) platform and customised for this project, is focused on documenting important social and political events in Turkey that have impacts on human rights and civil liberties. These include incidents of government oppression, police brutality, unjust court verdicts, media censorship, suppression of protests, and other human rights violations. The database intends to be a living document that will continue to be updated as new events occur. While we are attempting to collect as many incidents as possible, we cannot possibly guarantee to collect them all. This map is not an exhaustive list of incidents in Turkey but rather a representation of significant events which we have been able to document and verify.",
          "## Data Sources",
          "The information in this map comes from varied sources including news reports, social media documentation, NGO reports, and firsthand accounts. The sources are carefully evaluated for reliability and accuracy. After collection, incidents are verified through cross-referencing multiple sources when possible.",
          "## Verification Process",
          "The data being collected is checked for accuracy, contextual information, and reliable sourcing. This level of verification is intended to provide a factual basis for understanding patterns of incidents in Turkey. Any claims contained within the sources have been carefully evaluated, though we acknowledge the complexity of fully determining responsibility in some cases.",
          "## Incident Categories",
          "Each incident is associated with one or more categories reflecting the type of violation or concern, such as government oppression, police brutality, unjust court verdicts, media censorship, protest suppression, or human rights violations. The categories help to organize and filter the incidents to identify patterns and areas of concern.",
          "## Descriptions",
          "Each incident is accompanied with source links, location information, date and time, and a brief description of what occurred, along with information about responsible parties where this can be reliably determined.",
          "## Filters",
          "Users can filter incidents by category, time period, or location to focus on specific types of events or patterns across time and space.",
          "## Privacy and Ethical Considerations",
          "We are committed to documenting these events while respecting privacy and ethical concerns. Where sensitive information might allow individuals to be identified or put at risk, we have taken steps to protect identities while preserving the factual basis of the incidents.",
          "## Feedback",
          "This platform will continue to evolve and be updated. We welcome feedback on our methodology and data collection. If you have information about incidents that should be included, corrections to existing entries, or suggestions for improving the platform, please use the contact information provided below.",
        ],
      },
      toolbar: {
        panels: {
          categories: {
            GOVT_OPPRESSION: {
              icon: "gavel",
              label: "Government Oppression",
              description: "Incidents of state-sanctioned oppression",
            },
            POLICE_BRUTALITY: {
              icon: "local_police",
              label: "Police Brutality",
              description: "Incidents of excessive force by police",
            },
            UNJUST_VERDICTS: {
              icon: "balance",
              label: "Unjust Court Verdicts",
              description: "Legal decisions that violate justice principles",
            },
            MEDIA_CENSORSHIP: {
              icon: "block",
              label: "Media Censorship",
              description: "Suppression of media and information",
            },
            PROTEST_SUPPRESSION: {
              icon: "campaign",
              label: "Suppression of Protests",
              description: "Actions against peaceful assembly",
            },
            HUMAN_RIGHTS: {
              icon: "people",
              label: "Human Rights Violations",
              description: "Violations of basic human rights",
            },
            OTHER: {
              icon: "more_horiz",
              label: "Other",
              description: "Other relevant incidents",
            }
          },
        },
      },
      spotlights: {},
    },
    ui: {
      coloring: {
        mode: "STATIC",
        maxNumOfColors: 9,
        defaultColor: "#dfdfdf",
        colors: [
          "#7E57C2",
          "#F57C00",
          "#FFEB3B",
          "#D34F73",
          "#08B2E3",
          "#A1887F",
          "#90A4AE",
          "#E57373",
          "#80CBC4",
        ],
      },
      card: {
        layout: {
          template: "sourced",
        },
      },
      carto: {
        eventRadius: 8,
      },
      timeline: {
        eventRadius: 9,
      },
      tiles: {
        current: "bellingcat-mapbox/cl0qnou2y003m15s8ieuyhgsy",
        default: "bellingcat-mapbox/cl0qnou2y003m15s8ieuyhgsy",
        satellite: "bellingcat-mapbox/cl1win2vp003914pdhateva6p"
      },
    },
    features: {
      USE_CATEGORIES: false,
      CATEGORIES_AS_FILTERS: false,
      COLOR_BY_CATEGORY: false,
      COLOR_BY_ASSOCIATION: true,
      USE_ASSOCIATIONS: true,
      USE_FULLSCREEN: true,
      USE_DOWNLOAD: true,
      USE_SOURCES: true,
      USE_SPOTLIGHTS: false,
      USE_SHAPES: false,
      USE_COVER: true,
      USE_INTRO: false,
      USE_SATELLITE_OVERLAY_TOGGLE: true,
      USE_SEARCH: false,
      USE_SITES: false,
      ZOOM_TO_TIMEFRAME_ON_TIMELINE_CLICK: one_day,
      FETCH_EXTERNAL_MEDIA: false,
      USE_MEDIA_CACHE: false,
      GRAPH_NONLOCATED: false,
      NARRATIVE_STEP_STYLES: false,
      CUSTOM_EVENT_FIELDS: [
        {
          key: "responsible_party",
          kind: "text",
          label: "Responsible Party",
          placeholder: "Entity responsible for the incident"
        },
        {
          key: "impact",
          kind: "text",
          label: "Impact",
          placeholder: "Impact of the incident"
        }
      ],
    },
  },
};

export default config;
