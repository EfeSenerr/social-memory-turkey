<h1 align="center">Social Memory Turkey</h1>

<h2 align="center">
	A platform for documenting major events, government actions, and civic issues in Turkey
</h2>

<p align="center">
<strong>
	TimeMap is a tool for exploration, monitoring and classification of incidents in time and space, originally forked from <a href="https://github.com/forensic-architecture/timemap">forensic-architecture/timemap</a>.
</strong>
</p>
<br>
<br>

<!-- TODO: Replace this with a Turkey-specific screenshot once available 
The current image shows a mock-up based on the original template
-->
![TimeMap preview](docs/example-timemap.png)

## Project Description

Social Memory Turkey is an interactive platform for chronicling and visualizing major events, government actions, injustices, and civic issues in Turkey. It serves as both a historical record and advocacy tool, documenting incidents in categories including:

- Government oppression
- Police brutality
- Unjust court verdicts
- Media censorship
- Suppression of protests
- Human rights violations
- And other significant events

Users can explore incidents by date, location, and category, gaining insights into patterns and developments over time.

## Development
* `npm install` to setup
* adjust any local configs in [config.js](config.js)
* `CONFIG=config.js npm run dev` or `npm run dev` if the file is named config.js
* For more info visit the [original repo](https://github.com/forensic-architecture/timemap)


## Deployment
Release with `npm run deploy`. 

## Contributing
Please read our [Contribution Guide](./CONTRIBUTING.md) and feel free to suggest your own contributions.

## Configurations

<details>
<summary>Documentation of <a href="config.js">config.js</a> </summary>

* `SERVER_ROOT` - points to the API base address
* `XXXX_EXT` - points to the respective JSONs of the data, for events, sources, and associations
* `API_DATA` - data endpoint that can be downloaded or integrated into external apps/visualizations
* `MAPBOX_TOKEN` - used to load the custom styles
* `DATE_FMT` and `TIME_FMT` - how to consume the events' date/time from the API
* `store.app.map` - configures the initial map view and the UX limits
* `store.app.cluster` - configures how clusters/bubbles are grouped into larger clusters, larger `radius` means bigger cluster bubbles
* `store.app.timeline` - configure timeline ranges, zoom level options, and default range
* `store.app.intro` - the intro panel that shows on start
* `store.app.cover` - configuration for the full page cover, the `description` is a list of markdown entities, can also contain html
* `store.ui.colors` and `store.ui.maxNumOfColors` are applied to filters, as they are selected

Easiest way to deploy the static files is through 
* `nvm use 16`
* `npm run build` (rather: `CI=false npm run build`)
* copy the files to your server, for example to `/var/www/html`

</details>
