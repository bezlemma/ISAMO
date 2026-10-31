# Contributing to ISAMO

Contributions can improve accessibility, fix bugs, add scientific resources or
improve the tools used by the avian research community.

## Make a change

1. Fork the repository and create a branch for your change.
2. Follow the local setup in [README.md](README.md). Use the fictional accounts;
   do not request or copy production records or credentials.
3. Keep the existing visual style unless a proposed design change has been agreed.
4. Run `npm run check:repository`, `npm test`, `npm run generate` and
   `npm run build:community`.
5. Open a pull request describing the problem, the change and how you checked it.
   Include a screenshot for interface changes and a primary source for new
   scientific resource links or society information.

Use `example.invalid` addresses for fixtures. Never commit database files,
mailing lists, credentials, private correspondence or completed member forms.
Generated output and local data belong in ignored directories.

## Review and release

The repository owner reviews contributions. Required checks cover tests,
builds, tracked-file restrictions, secrets and code security. Keep dependency
and workflow changes focused so their effect can be reviewed.

Contributors cannot deploy the website or access the production database.
Merging a pull request does not publish a release. The owner starts the release
workflow on `main`, reviews the commit and approves its protected environment.
Cloudflare backend releases require separate administrator access.

The sole owner can merge an owner-authored pull request without another
reviewer, but must still use a pull request and pass the required checks.
This exception does not grant contributors direct write or deployment access.

## Existing clones

The repository was recreated with a fresh history on 31 October 2026. If your clone predates
that cleanup, make a fresh clone. Copy only reviewed source changes onto a new
branch; do not merge or push the old history back into this repository.

## Security reports and licensing

Report vulnerabilities privately using [SECURITY.md](SECURITY.md). Do not post
credentials or personal records in public issues or pull requests.

Code contributions are submitted under the repository's MIT licence. Only
contribute material you have permission to share. Images and society documents
need separate permission from their owners.
