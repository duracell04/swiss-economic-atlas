# Governing scope: the history of Swiss prosperity

The Swiss Economic Atlas is an interactive, source-transparent history of Switzerland's economy and living standards. Its governing question is how prosperity is produced, shared, financed and sustained, and how institutions, international developments and crises change it.

Connect three questions: **What happened to the economy? What happened to people? What mechanisms and institutions might explain the relationship?** This is the project's adopted analytical scope, informed by historical and statistical frameworks. It does not claim personal approval from Tobias Straumann, Reiner Eichenberger or other researchers.

## Ten thematic modules

| Module | Core coverage | Historical question |
| --- | --- | --- |
| 1. Output and productivity | GDP, GDP per person, hourly productivity, investment | How much prosperity comes from productivity, labour and capital? |
| 2. Population and labour | Population, migration, employment, hours, unemployment, age structure | How do demographic change and labour supply shape development? |
| 3. Purchasing power and household income | Prices, inflation, real wages, disposable income, consumption per person | Do gains in output translate into household purchasing power? |
| 4. Money and monetary policy | Policy instruments, market rates, government yields, money, SNB balance sheet | How do monetary regimes, liquidity and financing costs change? |
| 5. The franc and international integration | Bilateral and effective exchange rates, trade, current account, external positions | How do foreign demand, capital flows and foreign conditions affect Switzerland? |
| 6. Credit, housing and banking | Credit, mortgages, property prices, borrowing costs, rents, vacancies, bank balance sheets | Where do exposures accumulate, and how do housing and finance interact? |
| 7. Government and public finances | Revenue, expenditure, fiscal balance, debt, spending composition | How do fiscal capacity, government responsibilities and crisis responses evolve? |
| 8. Distribution and social protection | Inequality, poverty, concentration, social benefits | Who participates in prosperity and economic security? |
| 9. Structural transformation and resources | Sectoral change, education, skills, energy, infrastructure | How do productive capabilities and resource constraints change? |
| 10. Saving, wealth and investment returns | Broad equity and bond returns, household saving and wealth, pension assets | How do wealth accumulation and returns develop alongside wages and production? |

Aim for roughly **40–50 carefully selected indicator families**. The initial inventory has 47. A family groups related views, such as GDP levels and growth; it is not a count of published datasets or a promise of uniform coverage. This is a design guideline, not an academic standard or a hard limit.

The authoritative module inventory, family priorities, existing series memberships and ordered acquisition plan are in `data/registry/scope.json`. Catalogue topics mirror the modules. The live Scope & roadmap page derives availability from the verified public manifest; a planned family cannot become published through an editorial status change. The former government-financing topic link retains a catalogue anchor.

## Priorities for remaining data

Maintain the verified foundation: GDP and GDP per person, hourly productivity and compatible total hours, population, SECO and ILO unemployment, prices and inflation, real wages and real median disposable equivalised income, policy instruments, yields, public debt and the franc. Source updates and material corrections take precedence over expansion.

Completed on 21 October 2026: the first exchange-rate priority now has five annual charts — CHF/EUR (1999–2025), CHF/USD (1971–2025), historical CHF/DEM (1950–1998), and nominal/CPI-based real effective CHF indices (1973–2025). Sources, different fixing conventions and the annual calculation are recorded in the [exchange-rate audit](https://github.com/duracell04/swiss-economic-atlas/blob/main/docs/source-audit/exchange-rates.md). This completes those two families, not the entire international-integration module.

**P1 — next additions, in this order:**

1. Mortgage borrowing costs and the distinct rental reference rate, real residential property prices, private credit / GDP, and mortgage volumes.
2. Exports, imports, trade balance and current-account balance.
3. Government revenue, expenditure and fiscal balance, with consistent GDP denominators.

Hourly productivity and compatible total actual hours were completed on 21 October 2026 for 1991–2025. They use the FSO's matched WPS vintage, not unadjusted pre-2010 Work Volume Statistics or nominal productivity. Source flags identify 2023–2025 as revised. See the [source audit](https://github.com/duracell04/swiss-economic-atlas/blob/main/docs/source-audit/productivity-hours.md).

The real wage/median-income priority was completed on 21 October 2026. FSO real gross wages cover 1942–2025 as a 1939=100 index, retaining the 1994 source/CPI-timing change. HBS real median disposable equivalised income covers 2000–2023 in monthly CHF at 2023 prices, with one estimate per year and a 2015 weighting break. These are different concepts, not interchangeable measures of pay. Nominal wage inputs and income confidence intervals remain in the original sources; this release publishes the two real level charts. See the [source audit](https://github.com/duracell04/swiss-economic-atlas/blob/main/docs/source-audit/wages-income.md).

The remaining priorities close missing connections between production, households, finance and the external economy. Audit inputs together when they share a denominator or deflator. This order is an editorial priority, not a deadline or a reason to hold back a fully verified, relevant series.

**P2 — following additions:** employment and participation; migration and age structure; investment and consumption; SARON, broad money and the SNB balance sheet; rents and vacancies; selected bank measures; spending composition; inequality, poverty and social protection; sectoral change, skills and energy.

**P3 — later extensions:** international investment positions, income/wealth concentration, selected infrastructure, one broad equity total-return baseline, government bond returns, household balance sheets and pension assets. Selective foreign and cantonal comparisons, nineteenth-century views and higher-frequency episode analysis also belong to later extensions.

Five existing dataset definitions remain unresolved. Individual three-month GMBF auction yields require verification of exact reuse terms, tranche selection and event identity; the annual GMBF series is already published. SMI and SMIC daily levels and their annual returns require authorised historical inputs and permission for the intended public use. Keep the SIX licensing placeholders. Prioritise one representative broad equity total-return series over multiple index variants, but verify any alternative's terms independently. Calculating returns does not settle reuse permissions.

## Time, geography and annual conventions

The main post-war view covers **1946–2026**. Support different starting dates and visible gaps. Extend selected, well-documented histories towards **1850 or 1870** when evidence supports them. Estimates and reconstructions retain their explicit status and methodological breaks.

The workspace is annual. Each series declares whether its annual observation is a flow total, annual mean, year-end stock, growth rate or holding-period return. Preserve the chosen deflator, denominator, quotation and reference year. Retain verified native monthly or daily observations when useful for audit or a later episode view.

On the adoption date, 21 October 2026, 2026 is incomplete. Completed-year observations, partial-year readings and forecasts must remain distinguishable. New annual means require complete years unless a separately defined partial-year series is explicitly reviewed. Existing partial-year yield readings retain their labelled month windows. Earlier years may also be provisional.

Switzerland stays central. Later international comparisons should initially use Germany, Austria, France, the Netherlands, Sweden and the United States for a small compatible set: output per person, productivity, inflation, unemployment, interest rates, credit and public debt. Include German and euro-area policy rates where they explain monetary conditions. Cantonal extensions begin with comparable public finances, income, population and selected housing or employment measures, driven by a specific question.

## Historical events and institutions are a parallel dataset

Curate monetary regimes, crises, trade arrangements, fiscal rules, social-insurance changes and major labour or migration reforms. Record the decision/announcement date, effective date or duration, responsible institution or government level, source and uncertainty. Keep evidence for decisions distinct from sources interpreting their consequences. Preserve contested interpretations.

Existing annual annotations are a foundation. Exact dates, institutional responsibilities and separately sourced interpretations need a future annotation-schema extension before this richer layer is claimed as implemented. National charts describe outcomes; explanations involving federalism often require cantonal comparisons and a suitable research design.

## Chart-first presentation and analytical limits

The target curated overview has six synchronised panels: (1) output and productivity; (2) work and household purchasing power; (3) monetary conditions and the franc; (4) trade and foreign conditions; (5) credit, housing and wealth; (6) public finances. Build it as its data becomes available. The current workspace starts empty and preserves saved/shared arrangements; this scope release does not pre-populate incomplete panels.

Keep linked year inspection, independent ranges, original units, visible breaks and optional sourced annotations. Real, per-capita, growth and GDP-share views require explicit calculations. Rebasing, period/regime comparisons and correlation tools are future capabilities, not implied by this document.

A future exploratory relationship view must report transformation, period, overlapping observations, lag and breaks. Trending series can produce misleading relationships. Co-movement and regime changes do not establish causation; causal claims require additional evidence and a research design.

## Admission rules and boundaries

A family earns its place by representing a missing outcome, exposing a mechanism, distinguishing competing explanations or enabling a meaningful comparison. Before publication require:

1. A precise definition, unit, population/institutional coverage and historical question.
2. An exact source, extraction selection, vintage, reproducible input and redistribution evidence.
3. Actual coverage, frequency, gaps, revision practice and methodological breaks.
4. Explicit annual aggregation, transformations, denominators and deflators.
5. Correct observation/revision statuses and appropriate extraction/calculation checks.
6. Membership in a scope family and catalogue module, with a priority for remaining work.

Preserve Swiss distinctions: SECO versus ILO unemployment; new-mortgage rates versus outstanding-mortgage averages versus the rental reference rate; Confederation versus consolidated government debt and different debt concepts; customs trade definitions and gold; headline versus sporting-event-adjusted GDP; historical instruments versus modern policy rates. A candidate definition or source landing page is not published evidence.

Individual securities, detailed company accounts, comprehensive municipal coverage, numerous financial-index variants and automated forecasting sit outside the core. Education, health, energy and environment enter selectively when they explain productive capacity, living standards or constraints. Maintenance effort and interpretability are part of admission decisions.

## Intellectual and statistical reference points

- [Historical Statistics of Switzerland](https://hsso.ch/en): a disciplinary map from population, wages and prices to trade, money, public finances and education.
- [Jordà–Schularick–Taylor Macrohistory Database](https://www.macrohistory.net/database/): a reference for connecting output, balance sheets, external flows, returns and crises. Dataset-specific terms still apply.
- [Tobias Straumann, UZH](https://www.hist.uzh.ch/de/fachbereiche/neuzeit/professuren/straumann.html) and [Rathke and Straumann, Made in Frankfurt?](https://doi.org/10.1057/s41294-024-00242-0): financial/monetary history and the connection between statistics, foreign conditions and documented decisions.
- [Reiner Eichenberger, University of Fribourg](https://www.unifr.ch/universitas/de/about/authors/reiner-eichenberger.html): institutions, incentives, federalism and public-finance questions as complementary perspectives.

These inform the project's synthesis; they are not endorsements or blanket redistribution grants. Exact dataset evidence remains in the source audits.
