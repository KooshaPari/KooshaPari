# Physical Products Review — Asset Candidates

Review workspace for GMK Arch and WITF Board first-iteration product visuals.

## Structure

```
asset-sources/physical-products-review/
  gmk-arch/
    wordmark-hero-354x90.png        # Existing wordmark (owned, byte-identical to hero.png)
    product-render-0m1fl5V.png      # Only actual product render found (320x121, UNCLEAR RIGHTS)
    interest-check-YP29bIB.png      # Creative terminal graphic (2667x1466, likely owned)
    provenance.json                 # Full provenance and search audit
  witf/
    provenance.json                 # Full provenance for WITF derivatives

public/projects/physical-products-review/
  gmk-arch/
    wordmark-hero-354x90.png        # Public copy of existing wordmark
  witf/
    hero-01-desktop.webp            # 1600x900 optimized from hero-01.jpg
    hero-01-mobile.webp             # 800x450 optimized from hero-01.jpg
    hero-02-desktop.webp            # 1600x900 optimized from hero-02.jpg
    hero-02-mobile.webp             # 800x450 optimized from hero-02.jpg
```

## Search Exhaustiveness

The following sources were audited for GMKArch product imagery:

| Source | Result |
|--------|--------|
| Retained repo (`koosha-phenotype/public/projects/gmk-arch/`) | hero.png 354x90 wordmark only |
| Retained repo (all image files >50KB) | No GMKArch product renders found |
| Original portfolio (`<REDACTED>.myportfolio.com`) | Same 354x90 wordmark + 512x512 Arch logo OG image |
| Geekhack thread (`topic=112566.0`) | 16 user images audited; only 1 shows actual GMKArch keycaps |
| Vercel deploy output | Same 354x90 hero.png only |
| Dist build output | Same 354x90 hero.png only |

**Conclusion**: The repository and original portfolio never contained a high-resolution GMKArch product render/photo. The 320x121 product render (`0m1fl5V.png`) is the only keyset visual found, sourced from the Geekhack thread.

## Rights Boundary

| Asset | Ownership | Licensing | Can Publish? |
|-------|-----------|-----------|--------------|
| `wordmark-hero-354x90.png` | <REDACTED> (retained) | review-pending | YES (already in production) |
| `product-render-0m1fl5V.png` | UNCLEAR | NOT CLEARED | **NO** — render may be by third-party renderer; Koosha uploaded to Imgur as thread vendor but may not own the render |
| `interest-check-YP29bIB.png` | Likely <REDACTED> | review-pending | LIKELY YES but confirm |
| WITF hero images + derivatives | <REDACTED> (retained 3840x2160 PNGs) | review-pending | YES (already in production) |

### Recommendation

- **WITF**: WebP derivatives are ready for use. Original retained sources are 3840x2160 PNGs.
- **GMKArch**: The 320x121 product render is a faithful visual candidate but resolution-constrained and has unclear licensing. A new high-resolution product render (or original source files from the designer "Ram") would be needed for production use as a hero image.
- **No data/JS/CSS was edited. No GitHub mutations performed. 5 repos remain frozen.**
