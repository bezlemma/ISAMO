# ISAMO

Website for the International Society for Avian Model Organisms:
[avianmodel.org](https://avianmodel.org/).

The Nuxt application and Cloudflare Worker source are open for contributions.
The production database, account credentials and mailing-list exports are
private and are not needed to work on the site.

## Run locally

Install Node.js 24 or newer, then run:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The local API listens only on 127.0.0.1:8787.
It uses an in-memory database that resets when the server stops.

| Fictional account | Email | Password |
| --- | --- | --- |
| Community member | member@example.invalid | local-demo-password-2026 |
| Administrator | admin@example.invalid | local-demo-password-2026 |

Local email and payments are disabled. No Cloudflare, Google or Stripe account
is required. All local account credentials above are public test fixtures.

## Contribute

Fork this repository, make a branch, and open a pull request. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the review process and
[SECURITY.md](SECURITY.md) for private vulnerability reports.

```sh
npm run check:repository
npm test
npm run generate
npm run build:community
```

Tests use fictional records and mocked payment and email services. Pull-request
checks receive no production credentials. Changes require review and passing
checks before merging; releases require a separate maintainer approval.

## Project files

- `pages/` and `components/`: website pages and interface.
- `data/`: public society content, events and scientific resource links.
- `community/worker.mjs`: authenticated accounts, posts, replies and events.
- `community/schema.sql` and `community/migrations/`: database structure only.
- `community/email.mjs`: confirmation email, retry queue and unsubscribe links.
- `community/payments.mjs`: disabled-by-default membership payment integration.
- `community/local-server.mjs`: isolated local API with fictional records.
- `hosting/` and `scripts/protect-preview.mjs`: encrypted demo hosting.

## Production releases

The **Deploy approved ISAMO demo** workflow is started manually on `main`.
Its `github-pages` environment is restricted to `main` and requires approval
from the repository owner before the job can access environment secrets.

The environment holds `ISAMO_DEMO_PASSWORD` and `ISAMO_COMMUNITY_KEY`.
The latter matches the Worker's `DEMO_KEY`. The production build explicitly
sets its API URL; ordinary local builds default to the local API.

Every hosted demo page and asset is encrypted before publication. The demo
password protects the hosted preview; public source content can be read on
GitHub. Never put private society documents or member records into source.

The backend is released separately by an authorised Cloudflare administrator
from the reviewed `tmp/community-worker.mjs` bundle. Its database binding and
secrets stay in Cloudflare. Preserve existing secret bindings on updates,
especially `AUTH_PEPPER`; changing it invalidates stored password hashes.
Record a D1 Time Travel bookmark before a database migration.

Backend deployment credentials are not available to GitHub workflows.
Email requires explicit configuration and `MAIL_ENABLED=true`.
Payments remain disabled until fees and terms are agreed and an authorised
Stripe setup supplies server-side keys, plan configuration and a signed webhook.
The prepared checkout covers one membership term, without automatic renewal.

## Licence

The source code is licensed under [MIT](LICENSE). Photographs, logos, society
documents and third-party scientific content are excluded unless separately
licensed. Their respective owners retain their rights.
