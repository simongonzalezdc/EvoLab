# Security Policy

## Supported Versions

Security fixes target the current `main` branch and latest public release. Older prototypes are not supported unless the same issue affects current code.

## Reporting a Vulnerability

Please do not open a public issue with exploit details, credentials, private save data, or personal information.

Report security concerns through GitHub Security Advisories or email `security@kyanitelabs.tech` with:

- affected component, route, or storage path;
- impact and reproduction steps;
- whether local saves, browser storage, or private data was exposed;
- browser and Node version.

Expected response: acknowledgement within 3 business days, triage within 7 business days, and a fix or mitigation plan based on severity.

## Project Security Notes

EvoLab is a browser-based simulator. Local saves and exported simulation data should be treated as user-owned data. Do not commit `.env` files, private telemetry, credentials, or generated caches.

Before a release, run:

```bash
npm audit --audit-level=high
npm run lint
npm run type-check
npm run build
npm test -- --run
gitleaks dir . --no-banner --redact
```

