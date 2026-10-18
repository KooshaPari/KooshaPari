# Security Policy

## Reporting a vulnerability

If you discover a security issue affecting `KooshaPari/KooshaPari`,
the operator's profile site, please report it privately rather than
opening a public issue.

**Contact**: open a GitHub issue tagged `security` only for
non-sensitive questions or use the channel you prefer for direct
contact.

## Scope

This repository is a static portfolio site (`vercel.json` + prerendered
HTML/CSS/JS in `dist/`). There is no live backend, no server-side
state, no user database, no authentication, and no secrets.
The `kooshapari.com` contact form is email-only.

## What is and is not in scope

**In scope**: content-injection issues in the published HTML/CSS/JS,
misconfigured security headers in `vercel.json`, or dependency
vulnerabilities in the npm toolchain (`package.json`,
`package-lock.json`).

**Out of scope**: third-party links out to external repositories
under `github.com/KooshaPari/*`; report those issues against the
relevant downstream repo.

## Response time

Expect a first acknowledgement within 7 days. Critical fixes will
land before any non-critical feature work.
