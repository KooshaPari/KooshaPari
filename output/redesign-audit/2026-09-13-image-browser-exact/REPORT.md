# Browser Exact Audit — 2026-09-13T01:19:04.808Z

**Slugs**: mcpforge, forgecode, frostify  
**Viewports**: mobile-390 (390x844), desktop-1440 (1440x1000)  
**Server**: Isolated loopback on port 56642  
**Cases**: 6 total

## Summary

| Case | h1 | Overflow | HTTP Errors | Page Errors | Request Failures | Images |
|------|-----|----------|-------------|-------------|------------------|--------|
| mcpforge@mobile-390 | Y | N | N | N | N | 0 |
| mcpforge@desktop-1440 | Y | N | N | N | N | 0 |
| forgecode@mobile-390 | Y | N | N | N | N | 0 |
| forgecode@desktop-1440 | Y | N | N | N | N | 0 |
| frostify@mobile-390 | Y | N | N | N | N | 0 |
| frostify@desktop-1440 | Y | N | N | N | N | 0 |

## Detailed Findings

### mcpforge@mobile-390

- **URL**: http://127.0.0.1:56642/work/mcpforge
- **Viewport**: 390x844
- **H1**: "MCPForge"
- **Overflow**: None
- **Images**: 0 total

### mcpforge@desktop-1440

- **URL**: http://127.0.0.1:56642/work/mcpforge
- **Viewport**: 1440x1000
- **H1**: "MCPForge"
- **Overflow**: None
- **Images**: 0 total

### forgecode@mobile-390

- **URL**: http://127.0.0.1:56642/work/forgecode
- **Viewport**: 390x844
- **H1**: "ForgeCode"
- **Overflow**: None
- **Images**: 0 total

### forgecode@desktop-1440

- **URL**: http://127.0.0.1:56642/work/forgecode
- **Viewport**: 1440x1000
- **H1**: "ForgeCode"
- **Overflow**: None
- **Images**: 0 total

### frostify@mobile-390

- **URL**: http://127.0.0.1:56642/work/frostify
- **Viewport**: 390x844
- **H1**: "Frostify"
- **Overflow**: None
- **Images**: 0 total

### frostify@desktop-1440

- **URL**: http://127.0.0.1:56642/work/frostify
- **Viewport**: 1440x1000
- **H1**: "Frostify"
- **Overflow**: None
- **Images**: 0 total

## Evidence

- **Browser**: Playwright Chromium (headless)
- **Script**: run-browser-exact.js
- **JSON**: browser-exact-results.json
- **Port**: 56642
- **Date**: 2026-09-13T01:19:04.808Z
