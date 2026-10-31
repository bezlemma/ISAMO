# Security

## Report a vulnerability

Use [GitHub's private vulnerability reporting form](https://github.com/bezlemma/ISAMO/security/advisories/new).
Describe the affected feature, the steps to reproduce the issue using fictional
data, and the expected and observed behaviour. Do not include member records,
passwords or payment details in a public issue.

## Data and access

Production member records and payment references stay in Cloudflare D1.
Server-side authentication and ownership checks govern access. Posting displays
the author's name and institution; it does not publish their email or research
profile. Mailing-list exports require administrator access.

Production credentials are kept in Cloudflare secrets and a protected GitHub
deployment environment. A source-code contribution grants no production access.
Pull-request tests use fictional data and receive no production secrets.

Do not test by extracting real records, sending unsolicited messages, making
payments or disrupting the live service. Use the local environment to reproduce
issues, and report any accidental exposure privately.

## Supported version

Security fixes apply to the current `main` branch. The retired PocketBase
backend is not supported. Old clones must not be used for deployments or merged
into the cleaned repository.
