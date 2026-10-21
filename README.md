# Swiss Economic Atlas

A lightweight interactive atlas for exploring Swiss economic history with independent chart ranges and synchronized year inspection. Indicators, topics, calculations and chart arrangements are independent, versioned records. Astro, TypeScript and npm; static GitHub Pages hosting; no backend or database.

## Governing scope

**The history of Swiss prosperity: how it is produced, shared, financed and sustained, and how institutions, international developments and crises change it.**

The adopted [scope policy](docs/scope.md) covers ten thematic modules and an initial inventory of 47 indicator families: output and productivity; population and labour; purchasing power and household income; money and monetary policy; the franc and international integration; credit, housing and banking; government and public finances; distribution and social protection; structural transformation and resources; saving, wealth and investment returns. Roughly 40–50 families is a design guideline, not a dataset count or a requirement for identical historical coverage.

The main view is annual and centred on 1946–2026. A curated six-panel overview, selected nineteenth-century histories and focused international/cantonal comparisons are development targets. Historical events and institutional regimes form a separately sourced context layer. The current workspace starts empty and retains saved/shared layouts.

The [scope registry](data/registry/scope.json) defines family memberships, priorities and acquisition order. The public [Scope & roadmap](https://duracell04.github.io/swiss-economic-atlas/scope/) derives availability from published datasets and distinguishes unresolved candidates from unacquired families.

- **Completed first priority:** five annual exchange-rate charts — CHF/EUR 1999–2025, CHF/USD 1971–2025, historical CHF/DEM 1950–1998, and nominal/CPI-based real effective CHF indices 1973–2025. See the [source audit](docs/source-audit/exchange-rates.md). The international-integration module still needs trade and external accounts.
- **Completed productivity priority:** FSO hourly real labour productivity (index 1991=100) and compatible total actual hours worked (million hours), both 1991–2025. Source-harmonised pre-2010 hours and revised 2023–2025 values remain explicit. See the [source audit](docs/source-audit/productivity-hours.md).
- **P1 — next:** real wages and disposable income; housing costs/prices and private/mortgage credit; trade and current account; government revenue, expenditure and fiscal balance.
- **P2 — following:** employment, migration and demographics; consumption/investment; SARON, money and SNB balance sheet; housing supply/bank measures; distribution, social protection, sectors, skills and energy.
- **P3 — later:** deeper external and household balance sheets, wealth concentration, selected infrastructure, broad equity and bond returns, pension assets and focused comparisons. Individual GMBF auctions and the four SMI/SMIC candidates remain unresolved source/licensing work; annual GMBF is already available.

An addition must enable a meaningful historical question and satisfy the [publication rules](docs/methodology.md). A planned family never grants permission to publish unverified observations.

**Production publishes verified nominal GDP, Confederation yields, the 10Y − 3M spread and general government gross debt / GDP.** The long yield includes a labeled historical proxy for 1946–1954; 2026 yields are partial-year observations with different month coverage and no derived spread. Broad gross debt covers 1946–2026, with explicit source breaks and a 2026 IMF forecast; it is not the Maastricht ratio. See the [yield audit](docs/source-audit/yields.md) and [debt audit](docs/source-audit/debt.md). Nominal GDP covers 1948–2025 in current CHF millions, with pre-1995 reconstructions identified; see the [GDP audit](docs/source-audit/gdp.md). The local demonstration remains synthetic. The original `switzerland_macro_1946_2026.html` informed the warm colours, compact controls and synchronized inspection; its compiled observations and recession dates were not imported.

## Start the interactive demonstration

Use Node.js 24 LTS (minimum 22.12) and npm:

```sh
npm ci
npm run dev:demo
```

Open `http://localhost:4321/swiss-economic-atlas/`. New workspaces start empty. The demonstration includes deliberate gaps, different starting dates, reconstructions, forecasts, revised/provisional observations and illustrative annotations. Every demo page displaying observations identifies them as synthetic.

Use **Add indicator** in the empty card to search by topic or name. The picker selects the full available annual range for the chosen indicator; shorten it before adding if desired. Each chart has its own editable years, and a new Add indicator card remains below the charts. Choose a new panel or any existing one. Use **Overlay** to move a whole chart, or the indicator’s ↗ control to move one line, onto any other chart. Separate and remove controls remain available; panel arrows reorder the workspace. Charts always use original values. Matching units share an axis; different units get separately labelled axes. Annual ILO unemployment rates for 2010–2025 and annual SECO registered unemployment for 1984–2025 are available for comparison; the verified monthly SECO source remains separately documented and downloadable for auditability. Reset clears the workspace.

Hover to inspect every panel at the same year. Click/tap to pin; Left/Right step, Home/End select endpoints, Escape releases. Pinned readouts scroll on phones. Save layouts locally or share configuration-only links. Demo and production have separate versioned browser storage.

```sh
npm run build:demo
npm run preview:demo
```

Demo inputs and output live only under ignored `.cache/`; they never replace production `public/data/` or `dist/`. If an Astro preview is already running, stop it with `npx astro preview stop` before switching preview modes.

## Production and checks

```sh
npm run check
npm run build:demo
npx playwright install chromium
npm run test:browser
npm run dev
```

`check` validates provenance and registries, runs pipeline/calculation/composition tests, checks TypeScript, builds production, and verifies Pages paths and publication isolation. Browser tests run the built demo and production artifacts at ports 4322/4323 with desktop and phone viewports. `npm run check:all` runs both check suites (install the browser first).

Production starts with government financing yields, their spread and broad public debt: verified annual additions available through **Add indicator**, plus native-frequency datasets in the catalogue and downloads. Other indicator definitions remain candidates. Only verified, redistributable real data may enter public downloads and the chart payload. Forecast and reconstructed points retain their explicit statuses. Builds fetch no live economic data. Historical debt data and adaptations use CC BY-NC-SA 4.0; modern debt data retain IMF and ecolod terms. These data do not inherit the MIT software licence.

## Independent layers

| Location | Purpose |
| --- | --- |
| `data/registry/registry.json` | Series statistical identities, sources, rights and immutable snapshot references |
| `data/registry/topics.json` | Many-to-many topic memberships |
| `data/registry/scope.json` / `docs/scope.md` | Ten-module governing inventory, remaining-data priorities and admission policy |
| `data/registry/transformations.json` | Calculation inputs, output, method and convention |
| `data/registry/presets.json` | Reusable panel arrangements, annual ranges, annotations and presentation colours |
| `data/registry/annotations.json` | Sourced events and intervals, with verification and real/synthetic identity |
| `data/raw/` / `data/canonical/` | Permitted original source bytes / normalized observations |
| `scripts/` | Local imports, validation, calculations and deterministic exports |
| `src/atlas/` | Composition contracts, reusable D3 SVG geometry/renderer and browser controls |
| `src/pages/series/` | Catalogue and detail routes generated from metadata |
| `tests/` / `tests/browser/` | Synthetic meaningful checks / automated atlas interaction tests |

Statistical registries and the public manifest use **schema 2.0.0**; the independent editorial scope registry uses **1.0.0**. Existing source records, series IDs and canonical CSV columns are preserved. A new indicator requires a scope family, topic membership, a series definition and validated observations. A new chart requires a preset record. See [composition contracts](docs/composition.md).

## Contributor workflow

1. Place the proposed indicator in a [scope family and priority](docs/scope.md), then audit its exact source, definition, coverage, revision practice and redistribution evidence using [publisher templates](docs/source-audit/README.md).
2. Register the series and its topic memberships; retain native frequency.
3. Import a supplied permitted CSV; register any derived calculations separately.
4. Validate and review observation changes, breaks, terms and methodology.
5. Submit a manually prepared pull request with evidence and checks.

```sh
npm run data:import -- --file /absolute/path/input.csv --series verified-series-id --source verified-source-id --retrieved-on 2026-10-07
npm run data:derive
npm run data:validate
npm run check:registries
npm run data:export
npm run demo
```

The final `demo` command demonstrates the local importer in a separate ignored fixture directory. The [contributor guide](docs/contributing.md) explains revisions and [methodology](docs/methodology.md) defines the statistical contract. Restricted files stay outside tracked/published directories.

## Chart arrangements and later milestones

New production workspaces start empty; Reset clears the workspace. The registry retains financing, reference and overview presets for saved/shared layouts and future curated arrangements. The six-panel scope target balances output/productivity, work/purchasing power, monetary conditions/the franc, trade/foreign conditions, credit/housing/wealth and public finances. It will be populated when the necessary verified data exists. Charts currently use original units; no rebasing control or preset selector is exposed.

Further acquisition follows the scope priorities. Native-frequency episode views, appropriate explicit transformations and exploratory Relationships/correlation analysis remain later milestones with their own methodological requirements.

## GitHub Pages

The repository is hosted at [duracell04/swiss-economic-atlas](https://github.com/duracell04/swiss-economic-atlas), with **Settings → Pages → GitHub Actions** enabled. Pushes to `main` run checks including the demo browser suite, then deploy **only `dist/` production artifacts**. Pull requests validate without deploying.

The owner and repository name from `GITHUB_REPOSITORY` determine `https://<owner>.github.io/swiss-economic-atlas/`; account sites use `/`. Optional local overrides are `SITE_URL` and `SITE_BASE` (use identical settings for build/path checks). The configuration follows [Astro's official deployment guide](https://docs.astro.build/en/guides/deploy/github/). No custom domain is configured. The repository was renamed from `helvetic-economic-indicators`; GitHub redirects repository links, but the old Pages website address does not redirect. Update bookmarks and shared URLs to `/swiss-economic-atlas/`, retaining any `#chart=` fragment. The [production website](https://duracell04.github.io/swiss-economic-atlas/) publishes committed, validated observations; the synthetic demonstration remains a local preview.

## Licences

[MIT](LICENSE) covers the software and original documentation; datasets retain source-specific usage terms. See [DATA_LICENSES.md](DATA_LICENSES.md).

Published real GDP growth (1949–2025) is selectable with historical reconstruction and the 1995 methodology boundary.

Population is available for 1861–2025 as published year-end counts in persons.
