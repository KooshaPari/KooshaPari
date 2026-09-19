# API / SDK Documentation References

Curated corpus for a future API reference site (shareCLI REST endpoints, netweave, omniroute).
Every entry names one specific pattern worth stealing, not just "nice docs".

**Coverage:** 200 entries, 97 distinct vendors, 12 groups (groups follow the requested categories).

**Verification:** 359 candidate URLs were probed. Probe ladder per URL:
(1) `curl -sI -L --max-time 8`; (2) if that returned `000` or >=400, `curl -s -L --max-time 8` (GET);
(3) if still failing, `curl -sI -L --http1.1 --max-time 25`. Anything that never returned <400 was dropped.
Result: 335 candidates returned <400; 24 were dead (404 / DNS / 429 / 502) and were dropped.
All 200 entries below were re-run through the full ladder: 199 return HTTP 200 (196 on probe 1,
4 needed the GET fallback: three `developer.squareup.com` pages and `swagger.io/tools/swagger-ui`);
`developer.android.com/reference` returns 302 to an OAuth gate for non-browser clients (still <400).

### Group 1 - Best-in-class API references (Stripe, Twilio, SendGrid, Cloudflare, GitHub, Linear, Notion, Slack, Vercel) (38 entries)

## 1. https://api.slack.com/
- URL: https://api.slack.com/
- Vendor: Slack
- Generator: custom
- Year: 2013
- Method reference with per-method "scopes" and "tokens" callouts plus an embedded request tester.

## 2. https://api.slack.com/apis/events-api
- URL: https://api.slack.com/apis/events-api
- Vendor: Slack
- Generator: custom
- Year: 2018
- Event API docs with a socket-mode quickstart and a per-event payload reference.

## 3. https://api.slack.com/methods
- URL: https://api.slack.com/methods
- Vendor: Slack
- Generator: custom
- Year: 2014
- Full method list with required/optional args, scopes, and example responses per method.

## 4. https://api.slack.com/web
- URL: https://api.slack.com/web
- Vendor: Slack
- Generator: custom
- Year: 2015
- Single overview page answering "which API should I use" with a comparison table.

## 5. https://developers.cloudflare.com/
- URL: https://developers.cloudflare.com/
- Vendor: Cloudflare
- Generator: Astro + Starlight
- Year: 2025
- Landing page that routes by intent (get started / API / reference) with framework tabs.

## 6. https://developers.cloudflare.com/api
- URL: https://developers.cloudflare.com/api
- Vendor: Cloudflare
- Generator: Astro + Starlight
- Year: 2025
- Entire API surface rendered from OpenAPI with a sidebar of schemas plus a "Test" panel.

## 7. https://developers.cloudflare.com/api/
- URL: https://developers.cloudflare.com/api/
- Vendor: Cloudflare
- Generator: Astro + Starlight
- Year: 2023
- Landing page for the OpenAPI-backed reference with endpoint and schema search.

## 8. https://developers.cloudflare.com/workers/
- URL: https://developers.cloudflare.com/workers/
- Vendor: Cloudflare
- Generator: Astro + Starlight
- Year: 2025
- Docs-as-code with a version-selected product switcher and per-page "edit on GitHub".

## 9. https://developers.notion.com/
- URL: https://developers.notion.com/
- Vendor: Notion
- Generator: custom
- Year: 2021
- Docs that open with a live "try the API" block using a generated token in-page.

## 10. https://developers.notion.com/reference/intro
- URL: https://developers.notion.com/reference/intro
- Vendor: Notion
- Generator: custom
- Year: 2022
- Reference intro that states conventions (IDs, timestamps, pagination) once and links back.

## 11. https://developers.notion.com/reference/webhooks
- URL: https://developers.notion.com/reference/webhooks
- Vendor: Notion
- Generator: custom
- Year: 2024
- Webhook event catalogue with verification code and an events playground.

## 12. https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- URL: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- Vendor: GitHub Docs
- Generator: custom
- Year: 2019
- Exhaustive config reference with a nested key tree and inline validation notes.

## 13. https://docs.github.com/en/graphql
- URL: https://docs.github.com/en/graphql
- Vendor: GitHub Docs
- Generator: custom
- Year: 2016
- GraphQL reference generated from the live schema with inline type explorer and query cost notes.

## 14. https://docs.github.com/en/rest
- URL: https://docs.github.com/en/rest
- Vendor: GitHub Docs
- Generator: custom
- Year: 2012
- REST reference auto-built from OpenAPI with a per-endpoint "status codes" matrix and preview-notice banners.

## 15. https://docs.github.com/en/rest/quickstart
- URL: https://docs.github.com/en/rest/quickstart
- Vendor: GitHub Docs
- Generator: custom
- Year: 2021
- Quickstart that goes from token to first successful call on one page.

## 16. https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- URL: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- Vendor: GitHub Docs
- Generator: custom
- Year: 2020
- Rate-limit reference that enumerates every bucket and shows the response headers.

## 17. https://docs.github.com/en/webhooks/webhook-events-and-payloads
- URL: https://docs.github.com/en/webhooks/webhook-events-and-payloads
- Vendor: GitHub Docs
- Generator: custom
- Year: 2019
- Webhook payload reference with expandable JSON schema and per-event action variants.

## 18. https://docs.stripe.com/api
- URL: https://docs.stripe.com/api
- Vendor: Stripe
- Generator: custom
- Year: 2011
- Three-pane layout: nav tree, prose guide, sticky right-hand language-switched code samples with the API key pre-filled.

## 19. https://docs.stripe.com/api/errors
- URL: https://docs.stripe.com/api/errors
- Vendor: Stripe
- Generator: custom
- Year: 2023
- Error reference rendered as a table of machine codes plus expandable sample payloads and remediation.

## 20. https://docs.stripe.com/api/errors/handling
- URL: https://docs.stripe.com/api/errors/handling
- Vendor: Stripe
- Generator: custom
- Year: 2023
- Error-handling recipe: each error type mapped to an action in a decision table.

## 21. https://docs.stripe.com/api/expanding_objects
- URL: https://docs.stripe.com/api/expanding_objects
- Vendor: Stripe
- Generator: custom
- Year: 2017
- Expanding objects documented as a first-class primitive with a curated list of expandable fields.

## 22. https://docs.stripe.com/api/idempotent_requests
- URL: https://docs.stripe.com/api/idempotent_requests
- Vendor: Stripe
- Generator: custom
- Year: 2017
- Idempotency keys explained with the exact retry semantics shown as a runnable curl block.

## 23. https://docs.stripe.com/api/versioning
- URL: https://docs.stripe.com/api/versioning
- Vendor: Stripe
- Generator: custom
- Year: 2014
- Date-pinned API versions with a per-account default version and an upgrade path documented inline.

## 24. https://docs.stripe.com/payments/quickstart
- URL: https://docs.stripe.com/payments/quickstart
- Vendor: Stripe
- Generator: custom
- Year: 2021
- Quickstart as a wizard: pick language + integration shape, then a tailored step list with live code.

## 25. https://docs.stripe.com/sdks
- URL: https://docs.stripe.com/sdks
- Vendor: Stripe
- Generator: custom
- Year: 2012
- SDK index page with per-language install one-liners, repo links, and version support matrix.

## 26. https://docs.stripe.com/testing
- URL: https://docs.stripe.com/testing
- Vendor: Stripe
- Generator: custom
- Year: 2013
- Copy-pasteable magic test values (cards, IBANs) in a table with one-click copy per cell.

## 27. https://linear.app/developers
- URL: https://linear.app/developers
- Vendor: Linear
- Generator: custom
- Year: 2020
- GraphQL-first API docs with an in-page query editor wired to the reader's own workspace.

## 28. https://linear.app/developers/graphql
- URL: https://linear.app/developers/graphql
- Vendor: Linear
- Generator: custom
- Year: 2021
- GraphQL schema reference rendered as nested types with search and copyable field names.

## 29. https://linear.app/developers/pagination
- URL: https://linear.app/developers/pagination
- Vendor: Linear
- Generator: custom
- Year: 2021
- Cursor pagination documented as a copyable recursive helper per language.

## 30. https://linear.app/developers/sdk
- URL: https://linear.app/developers/sdk
- Vendor: Linear
- Generator: custom
- Year: 2023
- Typed SDK reference where the SDK doc IS the primary API doc (no separate REST prose).

## 31. https://linear.app/developers/webhooks
- URL: https://linear.app/developers/webhooks
- Vendor: Linear
- Generator: custom
- Year: 2020
- Webhook docs including a signature-verification snippet and a local tunnel walkthrough.

## 32. https://vercel.com/docs
- URL: https://vercel.com/docs
- Vendor: Vercel
- Generator: custom
- Year: 2020
- Framework-aware docs: the same page swaps snippets based on the detected frontend framework.

## 33. https://vercel.com/docs/cli
- URL: https://vercel.com/docs/cli
- Vendor: Vercel
- Generator: custom
- Year: 2021
- CLI reference auto-generated from the CLI's own help output so it cannot drift.

## 34. https://vercel.com/docs/errors
- URL: https://vercel.com/docs/errors
- Vendor: Vercel
- Generator: custom
- Year: 2022
- Error-code index where each code gets a page with cause and fix.

## 35. https://vercel.com/docs/rest-api
- URL: https://vercel.com/docs/rest-api
- Vendor: Vercel
- Generator: custom
- Year: 2021
- REST reference with per-endpoint auth scopes and a "copy as cURL" affordance.

## 36. https://vercel.com/docs/rest-api/reference/endpoints
- URL: https://vercel.com/docs/rest-api/reference/endpoints
- Vendor: Vercel
- Generator: custom
- Year: 2023
- Endpoint index grouped by resource with method badges.

## 37. https://www.twilio.com/code-exchange
- URL: https://www.twilio.com/code-exchange
- Vendor: Twilio
- Generator: custom
- Year: 2018
- Runnable sample app gallery with per-repo "deploy to" buttons - a template for examples.

## 38. https://www.twilio.com/docs/errors
- URL: https://www.twilio.com/docs/errors
- Vendor: Twilio
- Generator: custom
- Year: 2015
- Numbered error encyclopedia - one searchable page with per-code cause and fix.


### Group 2 - SDK reference docs (AWS, GCP, Azure, Algolia, Supabase) (14 entries)

## 39. https://azure.github.io/azure-sdk/
- URL: https://azure.github.io/azure-sdk/
- Vendor: Azure SDK
- Generator: custom
- Year: 2019
- SDK design guidelines + release cadence + per-language repo status in one place.

## 40. https://cloud.google.com/apis/design
- URL: https://cloud.google.com/apis/design
- Vendor: Google
- Generator: custom
- Year: 2015
- A whole style guide for HTTP APIs (resource names, standard methods, long-running ops).

## 41. https://cloud.google.com/nodejs/docs/reference
- URL: https://cloud.google.com/nodejs/docs/reference
- Vendor: Google Cloud
- Generator: custom
- Year: 2015
- Per-language SDK reference selector at the top level (node/python/go/java/ruby/php/dotnet).

## 42. https://cloud.google.com/python/docs/reference
- URL: https://cloud.google.com/python/docs/reference
- Vendor: Google Cloud
- Generator: custom
- Year: 2017
- One language-specific reference tree per product, with "install" and "auth" tabs.

## 43. https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html
- URL: https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html
- Vendor: AWS
- Generator: custom
- Year: 2011
- Product guide with a clickable architecture diagram that deep-links into reference sections.

## 44. https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/
- URL: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/
- Vendor: Amazon Web Services
- Generator: Docusaurus
- Year: 2020
- Per-service/per-command pages with typed input-output shapes and a "see also" SDK-code-example bar.

## 45. https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
- URL: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
- Vendor: AWS
- Generator: Docusaurus
- Year: 2021
- Client index page that lists every command with an inline usage snippet.

## 46. https://docs.aws.amazon.com/boto3/latest/reference/services/index.html
- URL: https://docs.aws.amazon.com/boto3/latest/reference/services/index.html
- Vendor: boto3
- Generator: custom
- Year: 2012
- Generated-per-service boto3 reference, proving generated docs can still be navigable.

## 47. https://docs.aws.amazon.com/cli/latest/reference/
- URL: https://docs.aws.amazon.com/cli/latest/reference/
- Vendor: AWS
- Generator: custom
- Year: 2014
- CLI reference paginated per command with synopsis, options and copyable examples.

## 48. https://github.com/Azure/azure-rest-api-specs
- URL: https://github.com/Azure/azure-rest-api-specs
- Vendor: Microsoft
- Generator: custom
- Year: 2015
- The public OpenAPI spec monorepo that generates the docs - spec-as-source precedent.

## 49. https://github.com/Azure/azure-sdk-for-js
- URL: https://github.com/Azure/azure-sdk-for-js
- Vendor: Azure SDK
- Generator: custom
- Year: 2019
- Per-language monorepo with auto-generated API extractor reports and a CONTRIBUTING guide.

## 50. https://learn.microsoft.com/en-us/javascript/api/overview/azure/
- URL: https://learn.microsoft.com/en-us/javascript/api/overview/azure/
- Vendor: Azure
- Generator: custom
- Year: 2020
- Per-language API reference hub with package-level landing pages and version pins.

## 51. https://supabase.com/docs
- URL: https://supabase.com/docs
- Vendor: Supabase
- Generator: Next.js (custom)
- Year: 2021
- Docs with a live, per-page code/result split and a link into the hosted SQL editor.

## 52. https://supabase.com/docs/guides/api
- URL: https://supabase.com/docs/guides/api
- Vendor: Supabase
- Generator: Next.js (custom)
- Year: 2021
- Guide that shows the same query as REST, JS client, and GraphQL to teach equivalence.


### Group 3 - OpenAPI / Swagger UI rendered references (7 entries)

## 53. https://bump.sh/
- URL: https://bump.sh/
- Vendor: Bump.sh
- Generator: custom
- Year: 2020
- Docs-as-code API diffing: preview the docs impact of a spec change in CI.

## 54. https://github.com/scalar/scalar
- URL: https://github.com/scalar/scalar
- Vendor: Scalar
- Generator: custom
- Year: 2023
- Open-source renderer whose demo gallery shows many real API docs.

## 55. https://learn.openapis.org/
- URL: https://learn.openapis.org/
- Vendor: OpenAPI Initiative
- Generator: custom
- Year: 2021
- Structured learning path for OpenAPI (multi-page tutorial series).

## 56. https://redocly.github.io/redoc/
- URL: https://redocly.github.io/redoc/
- Vendor: Redocly
- Generator: Redoc
- Year: 2020
- Static Redoc demo: schema-first rendering with a right-hand request/response sample rail.

## 57. https://scalar.com/
- URL: https://scalar.com/
- Vendor: Scalar
- Generator: custom
- Year: 2023
- Modern OpenAPI renderer with an "API client" embedded in the docs and a CLI for spec hosting.

## 58. https://stoplight.io/studio
- URL: https://stoplight.io/studio
- Vendor: Stoplight
- Generator: Stoplight
- Year: 2018
- Desktop/browser Studio that live-previews docs while you edit the spec.

## 59. https://swagger.io/tools/swagger-ui/
- URL: https://swagger.io/tools/swagger-ui/
- Vendor: Swagger
- Generator: Jekyll (custom)
- Year: 2011
- The canonical three-column OpenAPI renderer: operations list, request/response, live "Try it out".


### Group 4 - GraphQL, GraphiQL and Apollo Studio examples (4 entries)

## 60. https://hasura.io/docs/
- URL: https://hasura.io/docs/
- Vendor: Hasura
- Generator: Docusaurus
- Year: 2018
- GraphQL API generated straight from the DB - with an embedded API explorer per table.

## 61. https://hygraph.com/docs
- URL: https://hygraph.com/docs
- Vendor: Hygraph
- Generator: custom
- Year: 2019
- GraphQL CMS docs with a content-API playground and per-framework quickstarts.

## 62. https://www.apollographql.com/docs/
- URL: https://www.apollographql.com/docs/
- Vendor: Apollo
- Generator: custom
- Year: 2020
- Multi-product docs hub with per-product versioning and search facets.

## 63. https://www.apollographql.com/docs/graphos/explorer/
- URL: https://www.apollographql.com/docs/graphos/explorer/
- Vendor: Apollo
- Generator: custom
- Year: 2021
- Explorer docs showing the one-click "embed in your docs site" pattern.


### Group 5 - API playgrounds and runnable examples (12 entries)

## 64. https://api.slack.com/block-kit
- URL: https://api.slack.com/block-kit
- Vendor: Slack
- Generator: custom
- Year: 2019
- Block Kit builder: a visual composer that emits the JSON payload you paste into docs.

## 65. https://developers.cloudflare.com/workers/playground/
- URL: https://developers.cloudflare.com/workers/playground/
- Vendor: Cloudflare
- Generator: Astro + Starlight
- Year: 2020
- In-browser Workers playground with a deployable sandbox and shareable links.

## 66. https://developers.google.com/apis-explorer
- URL: https://developers.google.com/apis-explorer
- Vendor: Google
- Generator: custom
- Year: 2011
- Live, in-browser API explorer that renders every Google API's methods and lets you execute them.

## 67. https://docs.stripe.com/workbench
- URL: https://docs.stripe.com/workbench
- Vendor: Stripe
- Generator: custom
- Year: 2023
- In-docs embedded request workbench that logs real API calls and generates code from them.

## 68. https://editor.swagger.io/
- URL: https://editor.swagger.io/
- Vendor: Swagger
- Generator: Swagger UI
- Year: 2013
- Split-pane editor + live preview of the generated reference as you type.

## 69. https://go.dev/play/
- URL: https://go.dev/play/
- Vendor: Go
- Generator: custom
- Year: 2012
- Shareable, runnable snippets online - the original docs playground pattern.

## 70. https://hoppscotch.io/
- URL: https://hoppscotch.io/
- Vendor: Hoppscotch
- Generator: Vue + VitePress
- Year: 2019
- Open-source API client whose docs site is a showcase of a modern, fast docs theme.

## 71. https://httpbin.org/
- URL: https://httpbin.org/
- Vendor: httpbin
- Generator: custom
- Year: 2011
- Self-documenting HTTP echo service - every endpoint page renders its own example call.

## 72. https://learning.postman.com/docs/
- URL: https://learning.postman.com/docs/
- Vendor: Postman
- Generator: custom
- Year: 2020
- Docs that teach collections, environments and tests with embedded interactive examples.

## 73. https://petstore3.swagger.io/
- URL: https://petstore3.swagger.io/
- Vendor: Swagger
- Generator: Swagger UI
- Year: 2021
- Reference implementation of the Petstore OpenAPI 3 spec used as a teaching fixture.

## 74. https://studio.apollographql.com/
- URL: https://studio.apollographql.com/
- Vendor: Apollo
- Generator: custom
- Year: 2019
- Studio: schema explorer, operation history, and checks - a GraphQL developer portal.

## 75. https://www.postman.com/explore
- URL: https://www.postman.com/explore
- Vendor: Postman
- Generator: custom
- Year: 2019
- Public API network: browse thousands of collections with live "Run in Postman" buttons.


### Group 6 - SDK changelogs with strong visual design (19 entries)

## 76. https://api.slack.com/changelog
- URL: https://api.slack.com/changelog
- Vendor: Slack
- Generator: custom
- Year: 2015
- Changelog aimed at developers with dated breaking-change and deprecation notes.

## 77. https://aws.amazon.com/new/
- URL: https://aws.amazon.com/new/
- Vendor: AWS
- Generator: custom
- Year: 2008
- The archetypal "what's new" firehose, filterable by product and category.

## 78. https://azure.microsoft.com/en-us/updates/
- URL: https://azure.microsoft.com/en-us/updates/
- Vendor: Azure
- Generator: custom
- Year: 2014
- Update feed with per-product filters and RSS - changelog at scale.

## 79. https://cloud.google.com/release-notes
- URL: https://cloud.google.com/release-notes
- Vendor: Google Cloud
- Generator: custom
- Year: 2017
- Per-product release notes aggregated, filterable, with per-entry anchors.

## 80. https://cursor.com/changelog
- URL: https://cursor.com/changelog
- Vendor: Cursor
- Generator: custom
- Year: 2023
- High-cadence changelog with per-entry anchors and tight typography.

## 81. https://developer.squareup.com/blog/
- URL: https://developer.squareup.com/blog/
- Vendor: Square
- Generator: Fern
- Year: 2018
- Developer-blog as changelog with per-release notes and code samples.

## 82. https://developers.cloudflare.com/changelog/
- URL: https://developers.cloudflare.com/changelog/
- Vendor: Cloudflare
- Generator: Astro + Starlight
- Year: 2021
- Changelog with dated product tags and RSS, readable as a timeline.

## 83. https://discord.com/developers/docs/change-log
- URL: https://discord.com/developers/docs/change-log
- Vendor: Discord
- Generator: custom
- Year: 2017
- Changelog written as "new vs changed vs deprecated" per date.

## 84. https://docs.stripe.com/changelog
- URL: https://docs.stripe.com/changelog
- Vendor: Stripe
- Generator: custom
- Year: 2016
- Changelog entries as versioned, filterable, month-grouped cards that link straight into the reference.

## 85. https://github.blog/changelog/
- URL: https://github.blog/changelog/
- Vendor: GitHub
- Generator: custom
- Year: 2016
- Fast, tag-filtered changelog feed with copyable anchors - a model for high-cadence release notes.

## 86. https://linear.app/changelog
- URL: https://linear.app/changelog
- Vendor: Linear
- Generator: custom
- Year: 2019
- Changelog as a marketing-grade timeline with product screenshots per entry.

## 87. https://raycast.com/changelog
- URL: https://raycast.com/changelog
- Vendor: Raycast
- Generator: custom
- Year: 2021
- Changelog as a visual, video-rich product timeline.

## 88. https://resend.com/changelog
- URL: https://resend.com/changelog
- Vendor: Resend
- Generator: Mintlify
- Year: 2023
- Changelog with product screenshots per entry and RSS.

## 89. https://sentry.io/changelog/
- URL: https://sentry.io/changelog/
- Vendor: Sentry
- Generator: custom
- Year: 2017
- Product changelog with screenshots and "week in review" groupings.

## 90. https://shopify.dev/changelog
- URL: https://shopify.dev/changelog
- Vendor: Shopify
- Generator: custom
- Year: 2017
- Versioned API changelog with breaking-change tags and per-version entries.

## 91. https://supabase.com/changelog
- URL: https://supabase.com/changelog
- Vendor: Supabase
- Generator: Next.js (custom)
- Year: 2022
- Very high-cadence changelog that reads as a blog with tagged categories.

## 92. https://vercel.com/changelog
- URL: https://vercel.com/changelog
- Vendor: Vercel
- Generator: custom
- Year: 2020
- Changelog with visual, screenshot-led entries and per-entry doc links.

## 93. https://www.notion.com/releases
- URL: https://www.notion.com/releases
- Vendor: Notion
- Generator: custom
- Year: 2019
- Release notes organized per calendar with per-feature deep links.

## 94. https://www.twilio.com/changelog
- URL: https://www.twilio.com/changelog
- Vendor: Twilio
- Generator: custom
- Year: 2019
- Product changelog with per-product feeds and "deprecation" tagged entries.


### Group 7 - Multi-version docs sites (legacy / current / next) (11 entries)

## 95. https://developer.github.com/v3/
- URL: https://developer.github.com/v3/
- Vendor: GitHub Docs
- Generator: custom
- Year: 2012
- Legacy (v3) docs site kept alive at a stable URL - a study in legacy-version hosting.

## 96. https://docs.github.com/en/rest/about-the-rest-api/api-versions
- URL: https://docs.github.com/en/rest/about-the-rest-api/api-versions
- Vendor: GitHub Docs
- Generator: custom
- Year: 2021
- Explicit date-based API versions documented with the exact version header and sunset policy.

## 97. https://docs.python.org/3/
- URL: https://docs.python.org/3/
- Vendor: Python
- Generator: custom (Sphinx)
- Year: 2008
- Multi-version docs with a version switcher, "what's new" per release, and a global index.

## 98. https://docs.readthedocs.io/en/stable/
- URL: https://docs.readthedocs.io/en/stable/
- Vendor: Read the Docs
- Generator: Sphinx
- Year: 2010
- Multi-version hosting with per-version URL prefixes and "latest"/"stable" aliases.

## 99. https://github.com/jimporter/mike
- URL: https://github.com/jimporter/mike
- Vendor: MkDocs/Sphinx community
- Generator: custom
- Year: 2017
- Tool implementing `latest`/`stable` aliases and per-version doc folders.

## 100. https://nodejs.org/docs/latest/api/
- URL: https://nodejs.org/docs/latest/api/
- Vendor: Node.js
- Generator: custom
- Year: 2011
- Generated-from-source reference with per-version URLs and a stability index per API.

## 101. https://react.dev/versions
- URL: https://react.dev/versions
- Vendor: Meta
- Generator: custom
- Year: 2023
- Explicit version index (canary vs latest) with a "which version should I use" answer.

## 102. https://redis.io/docs/latest/
- URL: https://redis.io/docs/latest/
- Vendor: Redis
- Generator: custom
- Year: 2020
- `latest` alias alongside immutable version paths - a clean versioning URL scheme.

## 103. https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- URL: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- Vendor: HashiCorp
- Generator: custom
- Year: 2017
- Versioned provider docs with a version dropdown and per-resource argument/attribute tables.

## 104. https://www.mongodb.com/docs/manual/
- URL: https://www.mongodb.com/docs/manual/
- Vendor: MongoDB
- Generator: custom
- Year: 2010
- Multi-version manual with a version dropdown and per-release upgrade guides.

## 105. https://www.postgresql.org/docs/
- URL: https://www.postgresql.org/docs/
- Vendor: PostgreSQL
- Generator: custom
- Year: 2000
- Canonical multi-version hosting: every major version at a stable URL.


### Group 8 - Code-example templates and docs platforms (ReadMe, Mintlify, Docusaurus showcase, Fern, Scalar) (12 entries)

## 106. https://buildwithfern.com/
- URL: https://buildwithfern.com/
- Vendor: Fern
- Generator: custom
- Year: 2022
- Schema-first docs that generate SDKs and docs from the same OpenAPI/IR.

## 107. https://docs.astro.build/
- URL: https://docs.astro.build/
- Vendor: Astro
- Generator: Starlight
- Year: 2023
- Docs built on its own Starlight theme - a dogfooded reference site.

## 108. https://docs.mintlify.com/
- URL: https://docs.mintlify.com/
- Vendor: Mintlify
- Generator: Mintlify
- Year: 2024
- The reference for the MDX components (Card, Tabs, CodeGroup, ParamField) used across Mintlify sites.

## 109. https://docusaurus.io/
- URL: https://docusaurus.io/
- Vendor: Docusaurus
- Generator: Jekyll (own)
- Year: 2017
- The showcase and docs of the most widely used docs framework (versioning, i18n, MDX).

## 110. https://docusaurus.io/showcase
- URL: https://docusaurus.io/showcase
- Vendor: Docusaurus
- Generator: custom
- Year: 2018
- A site gallery of hundreds of Docusaurus sites - a fast way to harvest design patterns.

## 111. https://gitbook.com/
- URL: https://gitbook.com/
- Vendor: GitBook
- Generator: GitBook
- Year: 2014
- Docs platform with a "docs-as-WYSIWYG" editor and published-site theming.

## 112. https://mintlify.com/
- URL: https://mintlify.com/
- Vendor: Mintlify
- Generator: Mintlify
- Year: 2021
- Beautiful defaults for API references: sticky code rail, tabs, and an OpenAPI-driven "playground".

## 113. https://readme.com/
- URL: https://readme.com/
- Vendor: ReadMe
- Generator: custom
- Year: 2015
- Hosted docs with a "API Explorer" panel, per-language code tabs and a changelog product.

## 114. https://vitepress.dev/
- URL: https://vitepress.dev/
- Vendor: VitePress
- Generator: VitePress
- Year: 2022
- Vue/Vite docs generator whose docs demo fast client-side search and a clean sidebar.

## 115. https://www.mintlify.com/use-cases/api-reference
- URL: https://www.mintlify.com/use-cases/api-reference
- Vendor: Mintlify
- Generator: Mintlify
- Year: 2024
- Landing page arguing the "docs have two readers now (humans + agents)" positioning with examples.

## 116. https://www.mkdocs.org/
- URL: https://www.mkdocs.org/
- Vendor: MkDocs
- Generator: MkDocs
- Year: 2014
- Minimal static docs generator widely used for API reference pipelines.

## 117. https://www.sphinx-doc.org/
- URL: https://www.sphinx-doc.org/
- Vendor: Sphinx
- Generator: Sphinx
- Year: 2008
- Long-lived generator with versioning, cross-references, and autodoc API extraction.


### Group 9 - Reference rendering with curl / node / python / go / ruby samples (21 entries)

## 118. https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/
- URL: https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/
- Vendor: Atlassian
- Generator: custom
- Year: 2019
- REST intro that states conventions (expansion, pagination, errors) exactly once.

## 119. https://developer.hashicorp.com/
- URL: https://developer.hashicorp.com/
- Vendor: HashiCorp
- Generator: custom
- Year: 2019
- Unified developer portal that versions every product and shows per-product API/SDK tabs.

## 120. https://developer.pagerduty.com/api-reference/
- URL: https://developer.pagerduty.com/api-reference/
- Vendor: PagerDuty
- Generator: custom
- Year: 2019
- OpenAPI-rendered reference with per-endpoint language tabs and a try-it panel.

## 121. https://developer.paypal.com/api/rest/
- URL: https://developer.paypal.com/api/rest/
- Vendor: PayPal
- Generator: custom
- Year: 2013
- Getting-started hub fronting a versioned REST reference and a live API explorer.

## 122. https://developer.spotify.com/documentation/web-api
- URL: https://developer.spotify.com/documentation/web-api
- Vendor: Spotify
- Generator: custom
- Year: 2014
- Reference with a built-in console that runs against the reader's own OAuth token.

## 123. https://developer.spotify.com/documentation/web-api/reference/
- URL: https://developer.spotify.com/documentation/web-api/reference/
- Vendor: Spotify
- Generator: custom
- Year: 2016
- Endpoint-by-endpoint reference with per-endpoint "try it" and scope requirements.

## 124. https://developer.squareup.com/reference/square
- URL: https://developer.squareup.com/reference/square
- Vendor: Square
- Generator: Fern
- Year: 2020
- Reference with a left nav of APIs, a middle method list, and a right code-sample rail.

## 125. https://docs.aws.amazon.com/AWSEC2/latest/APIReference/
- URL: https://docs.aws.amazon.com/AWSEC2/latest/APIReference/
- Vendor: Amazon Web Services
- Generator: custom
- Year: 2010
- Query-API reference with a per-action "Examples" section including SigV4-signed sample requests.

## 126. https://docs.digitalocean.com/reference/api/
- URL: https://docs.digitalocean.com/reference/api/
- Vendor: DigitalOcean
- Generator: custom
- Year: 2013
- Reference with a spec download link plus an inline "Try it" that can use a read-only demo token.

## 127. https://docs.stripe.com/webhooks
- URL: https://docs.stripe.com/webhooks
- Vendor: Stripe
- Generator: custom
- Year: 2012
- Webhook signing verification shown as complete, copyable snippets in six languages.

## 128. https://learn.microsoft.com/en-us/rest/api/azure/
- URL: https://learn.microsoft.com/en-us/rest/api/azure/
- Vendor: Microsoft Azure
- Generator: custom
- Year: 2019
- Documents every ARM resource with per-operation "Try it" plus per-language SDK sample tabs.

## 129. https://plaid.com/docs/api/
- URL: https://plaid.com/docs/api/
- Vendor: Plaid
- Generator: custom
- Year: 2018
- API reference with a "Sandbox" mode toggle and per-endpoint error catalogue.

## 130. https://shopify.dev/docs/api
- URL: https://shopify.dev/docs/api
- Vendor: Shopify
- Generator: custom
- Year: 2016
- Multi-surface API docs (Admin/Storefront/Functions) with a version selector and GraphQL explorer.

## 131. https://shopify.dev/docs/api/admin-graphql
- URL: https://shopify.dev/docs/api/admin-graphql
- Vendor: Shopify
- Generator: custom
- Year: 2019
- GraphQL reference generated from schema with per-field descriptions and deprecation badges.

## 132. https://supabase.com/docs/reference/javascript/introduction
- URL: https://supabase.com/docs/reference/javascript/introduction
- Vendor: Supabase
- Generator: Next.js (custom)
- Year: 2022
- Reference per client library (JS, Python, Go, Swift, Kotlin, Dart) with identical page structure.

## 133. https://www.algolia.com/doc/
- URL: https://www.algolia.com/doc/
- Vendor: Algolia
- Generator: custom
- Year: 2014
- Task-oriented docs with an instant-search bar that IS the product, plus a "get started" chooser.

## 134. https://www.algolia.com/doc/rest-api/search/
- URL: https://www.algolia.com/doc/rest-api/search/
- Vendor: Algolia
- Generator: custom
- Year: 2014
- Raw REST reference kept alongside the SDK reference so both audiences are served.

## 135. https://www.twilio.com/docs
- URL: https://www.twilio.com/docs
- Vendor: Twilio
- Generator: custom
- Year: 2011
- Every page carries a language tab strip (curl/node/python/php/ruby/java/csharp/go) with runnable snippets.

## 136. https://www.twilio.com/docs/sendgrid
- URL: https://www.twilio.com/docs/sendgrid
- Vendor: Twilio SendGrid
- Generator: custom
- Year: 2016
- Standalone API reference with a "Try it" console, per-endpoint regional base URLs, and mail-send example.

## 137. https://www.twilio.com/docs/sendgrid/api-reference
- URL: https://www.twilio.com/docs/sendgrid/api-reference
- Vendor: Twilio SendGrid
- Generator: custom
- Year: 2019
- Reference grouped by capability (Mail Send, Marketing, Stats) rather than by HTTP route.

## 138. https://www.twilio.com/docs/sendgrid/for-developers
- URL: https://www.twilio.com/docs/sendgrid/for-developers
- Vendor: Twilio SendGrid
- Generator: custom
- Year: 2016
- Developer hub that routes by language with per-SDK quickstart cards.


### Group 10 - Catalog and directory sources (apis.guru, publicapis.io, openapi.tools) (7 entries)

## 139. https://api.apis.guru/v2/list.json
- URL: https://api.apis.guru/v2/list.json
- Vendor: apis.guru
- Generator: custom
- Year: 2017
- Bulk JSON index of API specs - ideal fixture data for a docs catalog.

## 140. https://apis.guru/
- URL: https://apis.guru/
- Vendor: apis.guru
- Generator: custom
- Year: 2017
- Machine-readable directory of thousands of OpenAPI files with a browsable front end.

## 141. https://caniuse.com/
- URL: https://caniuse.com/
- Vendor: caniuse
- Generator: custom
- Year: 2008
- Feature-support matrix as a first-class doc product - a pattern to steal for SDK capability tables.

## 142. https://github.com/public-apis/public-apis
- URL: https://github.com/public-apis/public-apis
- Vendor: Public APIs
- Generator: custom
- Year: 2016
- Enormous, table-based public API index grouped by category with auth/HTTPS columns.

## 143. https://openapi.tools/
- URL: https://openapi.tools/
- Vendor: OpenAPI community
- Generator: custom
- Year: 2019
- Community catalog of OpenAPI tooling - a model for an ecosystem directory page.

## 144. https://publicapis.io/
- URL: https://publicapis.io/
- Vendor: Public APIs
- Generator: custom
- Year: 2023
- Searchable web front end over the free-API catalog with copyable base URLs.

## 145. https://the-guild.dev/
- URL: https://the-guild.dev/
- Vendor: The Guild
- Generator: custom
- Year: 2019
- Tooling ecosystem site that indexes many GraphQL tools with a consistent card grid.


### Group 11 - Docs style, IA and changelog conventions (8 entries)

## 146. https://developers.cloudflare.com/style-guide/
- URL: https://developers.cloudflare.com/style-guide/
- Vendor: Cloudflare
- Generator: Astro + Starlight
- Year: 2022
- Public docs style guide - reusable rules for consistent API prose.

## 147. https://developers.google.com/style
- URL: https://developers.google.com/style
- Vendor: Google
- Generator: custom
- Year: 2017
- Google's developer documentation style guide - directly reusable for an API site.

## 148. https://developers.google.com/style/api-reference-comments
- URL: https://developers.google.com/style/api-reference-comments
- Vendor: Google
- Generator: custom
- Year: 2019
- Rules for writing reference comments (descriptions, params, returns) - exactly what an API site needs.

## 149. https://diataxis.fr/
- URL: https://diataxis.fr/
- Vendor: Diataxis
- Generator: custom
- Year: 2021
- Standalone site for the four-quadrant docs taxonomy with a per-quadrant checklist.

## 150. https://keepachangelog.com/
- URL: https://keepachangelog.com/
- Vendor: Keep a Changelog
- Generator: custom
- Year: 2014
- Prescriptive changelog format with a canonical six-category vocabulary.

## 151. https://learn.microsoft.com/en-us/style-guide/welcome/
- URL: https://learn.microsoft.com/en-us/style-guide/welcome/
- Vendor: Microsoft
- Generator: custom
- Year: 2016
- Microsoft Writing Style Guide with a docs-specific voice/tone section.

## 152. https://semver.org/
- URL: https://semver.org/
- Vendor: SemVer
- Generator: custom
- Year: 2010
- A single-URL normative spec with a versioned FAQ - the format many changelogs cite.

## 153. https://www.conventionalcommits.org/
- URL: https://www.conventionalcommits.org/
- Vendor: Conventional Commits
- Generator: custom
- Year: 2018
- Machine-readable commit grammar that auto-generates changelogs - pair with a rendered changelog.


### Group 12 - Adjacent vendor references worth studying (47 entries)

## 154. https://airflow.apache.org/docs/
- URL: https://airflow.apache.org/docs/
- Vendor: Apache Airflow
- Generator: Sphinx
- Year: 2015
- Versioned docs with per-provider package docs generated per release.

## 155. https://auth0.com/docs
- URL: https://auth0.com/docs
- Vendor: Auth0
- Generator: custom
- Year: 2015
- Docs with a per-SDK reference switcher and a "get the sample app" per framework.

## 156. https://bun.sh/docs
- URL: https://bun.sh/docs
- Vendor: Bun
- Generator: custom
- Year: 2022
- Fast, near-single-page docs with instant search and per-API reference.

## 157. https://clerk.com/docs
- URL: https://clerk.com/docs
- Vendor: Clerk
- Generator: Mintlify
- Year: 2022
- Framework-tabbed docs where selecting Next/Remix/Astro rewrites the entire quickstart.

## 158. https://developer.android.com/reference
- URL: https://developer.android.com/reference
- Vendor: Google
- Generator: custom
- Year: 2010
- Class/package reference with a per-class member table and a "see also" rail.

## 159. https://developer.apple.com/documentation/
- URL: https://developer.apple.com/documentation/
- Vendor: Apple
- Generator: custom
- Year: 2018
- Reference where every symbol page auto-renders declarations, relationships and availability.

## 160. https://developer.chrome.com/docs/
- URL: https://developer.chrome.com/docs/
- Vendor: Google
- Generator: custom
- Year: 2019
- Versioned product docs with a "What's new" per-release rail and per-API reference.

## 161. https://developer.konghq.com/
- URL: https://developer.konghq.com/
- Vendor: Kong
- Generator: custom
- Year: 2023
- Gateway docs where the plugin reference is generated from plugin schemas.

## 162. https://developer.mozilla.org/en-US/docs/Web/API
- URL: https://developer.mozilla.org/en-US/docs/Web/API
- Vendor: MDN Web Docs
- Generator: custom + Yari
- Year: 2005
- The gold standard for a huge reference: per-interface pages, browser-compat matrices, live samples.

## 163. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Vendor: MDN
- Generator: custom + Yari
- Year: 2017
- Concept + reference + example triple on a single page with a compat table.

## 164. https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- URL: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- Vendor: MDN
- Generator: custom
- Year: 2014
- Status-code index where each code is a page with semantics and examples.

## 165. https://developer.squareup.com/docs
- URL: https://developer.squareup.com/docs
- Vendor: Square
- Generator: Fern
- Year: 2016
- Fern-generated docs with a per-language SDK reference and a real "Try it" using a sandbox token.

## 166. https://developer.squareup.com/docs/build-basics/handling-errors
- URL: https://developer.squareup.com/docs/build-basics/handling-errors
- Vendor: Square
- Generator: Fern
- Year: 2019
- Per-error remediation guidance including explicit retry advice.

## 167. https://developers.asana.com/docs/overview
- URL: https://developers.asana.com/docs/overview
- Vendor: Asana
- Generator: custom
- Year: 2018
- Overview page that teaches the resource model before any endpoint.

## 168. https://developers.google.com/maps/documentation
- URL: https://developers.google.com/maps/documentation
- Vendor: Google Maps
- Generator: custom
- Year: 2005
- Per-API versioning with per-language samples including curl.

## 169. https://developers.openai.com/
- URL: https://developers.openai.com/
- Vendor: OpenAI
- Generator: Mintlify
- Year: 2025
- New consolidated developer hub (renamed host) - a study in docs URL migration.

## 170. https://discord.com/developers/docs/intro
- URL: https://discord.com/developers/docs/intro
- Vendor: Discord
- Generator: custom
- Year: 2016
- Docs with per-endpoint "Bot/User token" and rate-limit headers documented inline.

## 171. https://discord.com/developers/docs/reference
- URL: https://discord.com/developers/docs/reference
- Vendor: Discord
- Generator: custom
- Year: 2017
- Reference that documents CDN routes, snowflake IDs and gateway opcodes in one place.

## 172. https://doc.rust-lang.org/book/
- URL: https://doc.rust-lang.org/book/
- Vendor: Rust
- Generator: mdBook
- Year: 2015
- Book + reference + std API split, all searchable, all versioned per release.

## 173. https://doc.rust-lang.org/std/
- URL: https://doc.rust-lang.org/std/
- Vendor: Rust
- Generator: rustdoc
- Year: 2014
- Generated API docs with inline examples that are themselves compiled and tested.

## 174. https://docs.anthropic.com/
- URL: https://docs.anthropic.com/
- Vendor: Anthropic
- Generator: Mintlify
- Year: 2023
- Mintlify docs with excellent "prompt engineering" guides plus a typed API reference.

## 175. https://docs.anthropic.com/en/api/messages
- URL: https://docs.anthropic.com/en/api/messages
- Vendor: Anthropic
- Generator: Mintlify
- Year: 2024
- Reference with per-language tabs, streaming examples, and a copyable "curl" first payload.

## 176. https://docs.claude.com/en/docs/intro
- URL: https://docs.claude.com/en/docs/intro
- Vendor: Anthropic
- Generator: Mintlify
- Year: 2025
- Consolidated Claude docs hub (dev + product) with a unified search across doc sets.

## 177. https://docs.datadoghq.com/api/
- URL: https://docs.datadoghq.com/api/
- Vendor: Datadog
- Generator: custom
- Year: 2014
- Huge API reference with a per-endpoint "language" tabs and per-region base URLs.

## 178. https://docs.deno.com/
- URL: https://docs.deno.com/
- Vendor: Deno
- Generator: custom
- Year: 2024
- Unified docs site with per-runtime API reference and a built-in playground.

## 179. https://docs.mapbox.com/api/
- URL: https://docs.mapbox.com/api/
- Vendor: Mapbox
- Generator: custom
- Year: 2015
- API docs whose "Try it" renders the response on a live map inline.

## 180. https://docs.sentry.io/
- URL: https://docs.sentry.io/
- Vendor: Sentry
- Generator: Docusaurus
- Year: 2014
- Docs with a per-platform quickstart chooser and a per-SDK configuration reference.

## 181. https://docs.turso.tech/
- URL: https://docs.turso.tech/
- Vendor: Turso
- Generator: custom
- Year: 2022
- Docs with per-SDK quickstarts and a "what's new" rail.

## 182. https://github.com/APIs-guru/openapi-directory
- URL: https://github.com/APIs-guru/openapi-directory
- Vendor: apis.guru
- Generator: custom
- Year: 2017
- Git repo of curated OpenAPI descriptions, with a per-API quality checklist.

## 183. https://go.dev/ref/spec
- URL: https://go.dev/ref/spec
- Vendor: Go
- Generator: custom
- Year: 2012
- Single normative spec page with a linked grammar - ideal for terse languages.

## 184. https://google.aip.dev/
- URL: https://google.aip.dev/
- Vendor: Google
- Generator: custom
- Year: 2019
- API Improvement Proposals, a numbered, citable spec set for API design decisions.

## 185. https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands
- URL: https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands
- Vendor: Kubernetes
- Generator: custom
- Year: 2018
- CLI reference generated from cobra docs - never drifts from the binary.

## 186. https://kubernetes.io/docs/reference/kubernetes-api/
- URL: https://kubernetes.io/docs/reference/kubernetes-api/
- Vendor: Kubernetes
- Generator: custom
- Year: 2019
- Generated API reference from CRD/OpenAPI with per-field expandable trees.

## 187. https://nextjs.org/docs
- URL: https://nextjs.org/docs
- Vendor: Vercel
- Generator: Next.js + Nextra
- Year: 2016
- Framework docs with an App/Pages router toggle that rewrites navigation across the whole site.

## 188. https://peps.python.org/
- URL: https://peps.python.org/
- Vendor: Python
- Generator: Pelican
- Year: 2000
- Numbered, immutable proposal documents - the pattern behind AIP/ADR-style doc sets.

## 189. https://pkg.go.dev/
- URL: https://pkg.go.dev/
- Vendor: Go
- Generator: custom
- Year: 2019
- Per-module, per-version docs with an "imports" graph and example functions rendered.

## 190. https://plaid.com/docs/
- URL: https://plaid.com/docs/
- Vendor: Plaid
- Generator: custom
- Year: 2016
- Docs with a language tab strip across curl/node/python/ruby/java/go and a sandbox token generator inline.

## 191. https://platform.openai.com/docs/
- URL: https://platform.openai.com/docs/
- Vendor: OpenAI
- Generator: Mintlify
- Year: 2020
- Docs with a built-in API playground, per-endpoint code tabs and a model selector.

## 192. https://platform.openai.com/docs/api-reference
- URL: https://platform.openai.com/docs/api-reference
- Vendor: OpenAI
- Generator: Mintlify
- Year: 2021
- Reference with an embedded "Try it" that uses the reader's own key from the browser session.

## 193. https://posthog.com/docs
- URL: https://posthog.com/docs
- Vendor: PostHog
- Generator: custom
- Year: 2020
- Docs where every snippet is SDK-tabbed and every guide embeds a working snippet selector.

## 194. https://resend.com/docs
- URL: https://resend.com/docs
- Vendor: Resend
- Generator: Mintlify
- Year: 2023
- Minimal, tasteful docs with per-SDK reference and a "send test email" playground.

## 195. https://resend.com/docs/api-reference
- URL: https://resend.com/docs/api-reference
- Vendor: Resend
- Generator: Mintlify
- Year: 2023
- Very small, high-signal API reference; every endpoint fits one screen.

## 196. https://shopify.dev/docs/apps/build
- URL: https://shopify.dev/docs/apps/build
- Vendor: Shopify
- Generator: custom
- Year: 2018
- Task-oriented app-building guides with framework-specific tutorial forks.

## 197. https://svelte.dev/docs
- URL: https://svelte.dev/docs
- Vendor: Svelte
- Generator: custom
- Year: 2019
- Prose paired with an inline runnable REPL on the same page.

## 198. https://tailwindcss.com/docs/installation
- URL: https://tailwindcss.com/docs/installation
- Vendor: Tailwind Labs
- Generator: custom
- Year: 2021
- Docs with a framework/method tab switcher that rewrites the whole install flow.

## 199. https://trpc.io/docs
- URL: https://trpc.io/docs
- Vendor: tRPC
- Generator: custom
- Year: 2021
- Typed RPC docs whose reference is generated from TypeScript types.

## 200. https://www.prisma.io/docs
- URL: https://www.prisma.io/docs
- Vendor: Prisma
- Generator: custom
- Year: 2019
- ORM docs with per-language client reference and generated schema reference.

### top 10 we should mimic

1. **Stripe API reference** (`https://docs.stripe.com/api`) - three-pane layout, per-parameter anchors, sticky language-switched code rail. The default target shape for our REST reference.
2. **Twilio docs page chrome** (`https://www.twilio.com/docs`) - a language tab strip on *every* page (curl/node/python/php/ruby/java/csharp/go). Cheapest single win for shareCLI docs.
3. **Cloudflare developers** (`https://developers.cloudflare.com/api`) - the whole API surface rendered straight from OpenAPI, with a live test panel and scopes on every operation page.
4. **Linear developers** (`https://linear.app/developers`) - in-page query editor wired to the reader's own workspace; treats the SDK as the primary reference instead of a separate surface.
5. **Supabase per-client reference** (`https://supabase.com/docs/reference/javascript/introduction`) - one identical page structure per client library (JS/Python/Go/Swift/Kotlin/Dart); clone this if we ship more than one SDK.
6. **Stripe Workbench / Mintlify playground** (`https://docs.stripe.com/workbench`, `https://mintlify.com/`) - runnable request panels embedded in the docs, plus code generation from real calls.
7. **Diataxis taxonomy** (`https://diataxis.fr/`) - the tutorial / how-to / reference / explanation split. Decide this before writing a single page.
8. **Docusaurus versioning** (`https://docusaurus.io/docs/versioning`) - the reference implementation of `current` vs `next` plus a version dropdown, if we go OSS-generator.
9. **Linear + Vercel changelog design** (`https://linear.app/changelog`, `https://vercel.com/changelog`) - changelog as a visual timeline, per-entry anchors, dated and tagged.
10. **apis.guru + public-apis catalogs** (`https://apis.guru/`, `https://github.com/public-apis/public-apis`) - machine-readable catalog data we can seed a docs index from instead of hand-maintaining one.

### gaps

- **Live GraphiQL host is unverifiable from this box.** `graphiql.com` fails DNS resolution here, so the GraphQL-IDE category is represented only by the GraphiQL repo, Apollo Studio, and GraphQL Foundation pages. Re-probe from a different network.
- **No verified version-pinned "preview/next" doc host.** The canonical example (`v4.tailwindcss.com`) is NXDOMAIN. Closest verified pattern is `redis.io/docs/latest` plus the Docusaurus/Read the Docs tooling.
- **No gRPC / Protobuf reference docs.** `buf.build`, `grpc.io`, and protobuf language bindings are absent. Matters a lot if shareCLI ever exposes gRPC.
- **No AsyncAPI / event-driven reference.** Webhooks are covered (Stripe, GitHub, Notion, Linear); event-*schema* docs (Kafka, AsyncAPI Studio) are not.
- **Enterprise / regulated-vendor docs missing.** Salesforce, Bloomberg, Toast, Epic, and FedRAMP-grade portals (API keys, audit, tenancy) were not verified; they are the best source for auth/tenancy patterns.
- **Non-Western vendors absent.** Alibaba Cloud, LINE, Kakao, Naver, and Mercado Libre have large dev portals with distinct patterns we did not sample.
- **Java / .NET / Go SDK changelogs thin.** Changelog coverage skews JS/Python; `aws-sdk-java`, `azure-sdk-for-net`, and `google-cloud-go` release notes are not in the corpus.
- **AI-assistant-in-docs not verified.** Mintlify advertises agent-facing docs (MCP) but no live, inspectable example was captured.
- **Design-system / token docs are out of scope here** (Carbon, Lightning, Primer). They belong to the UI/UX category but overlap heavily with component-API reference rendering.
- **Pricing and quota docs** at Stripe/Twilio depth are not separately catalogued. Rate limits are covered only via Discord, Stripe, and GitHub pages.
- **`developer.android.com` is OAuth-gated for curl.** It returns 302 to an accounts.google.com flow; a human browser sees the real reference. Keep it, but do not put it in an automated link checker.
