# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: acceptance.spec.js >> ShareCLI desktop and mobile accessibility
- Location: tests/browser/acceptance.spec.js:164:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4197/work/sharecli
Call log:
  - navigating to "http://127.0.0.1:4197/work/sharecli", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - generic [ref=f1e6]:
    - heading "This site can’t be reached" [level=1] [ref=f1e7]
    - paragraph [ref=f1e8]:
      - strong [ref=f1e9]: 127.0.0.1
      - text: refused to connect.
    - generic [ref=f1e10]:
      - paragraph [ref=f1e11]: "Try:"
      - list [ref=f1e12]:
        - listitem [ref=f1e13]: Checking the connection
        - listitem [ref=f1e14]:
          - link "Checking the proxy and the firewall" [ref=f1e15] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=f1e16]: ERR_CONNECTION_REFUSED
  - generic [ref=f1e17]:
    - button "Reload" [ref=f1e19] [cursor=pointer]
    - button "Details" [ref=f1e20] [cursor=pointer]
```

# Test source

```ts
  67  |   await page.reload();
  68  |   await expect(page.locator('html')).toHaveAttribute('data-reader', 'false');
  69  |   await page.evaluate(() => localStorage.clear());
  70  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  71  |   await page.reload();
  72  |   await expect(page.locator('html')).toHaveAttribute('data-reader', 'true');
  73  |   await page.locator('#reader-toggle').click();
  74  |   await page.reload();
  75  |   await expect(page.locator('html')).toHaveAttribute('data-reader', 'false');
  76  | });
  77  | 
  78  | test('clean navigation and saved lens', async ({ page }) => {
  79  |   await page.goto('/');
  80  |   await dismissConstructionGate(page);
  81  |   await page.getByRole('link', { name: 'Read Product', exact: true }).click();
  82  |   await expect(page).toHaveURL(/\/product$/);
  83  |   await expect(page.locator('html')).toHaveAttribute('data-lens', 'product');
  84  |   await page.goto('/work/sharecli');
  85  |   await dismissConstructionGate(page);
  86  |   await expect(page.locator('html')).toHaveAttribute('data-lens', 'product');
  87  |   await page.getByRole('link', { name: 'Back to work' }).click();
  88  |   await expect(page).toHaveURL(/\/work$/);
  89  |   await page.goBack();
  90  |   await dismissConstructionGate(page);
  91  |   await expect(page.locator('#view-root h1')).toHaveText('ShareCLI');
  92  |   await page.getByRole('button', { name: 'Index', exact: true }).click();
  93  |   await page.locator('dialog a[href="/work/substrate"]').click();
  94  |   await expect(page).toHaveURL(/\/work\/substrate$/);
  95  |   await dismissConstructionGate(page);
  96  |   await expect(page.locator('#view-root h1')).toHaveText('Substrate');
  97  | });
  98  | 
  99  | test('all project pages have no-JavaScript content and downloads', async ({ browser }) => {
  100 |   const context = await browser.newContext({ javaScriptEnabled: false });
  101 |   const page = await context.newPage();
  102 |   try {
  103 |     for (const project of PROJECTS) {
  104 |       await page.goto(`http://127.0.0.1:4197/work/${project.slug}`);
  105 |       await expect(page.locator('main h1')).toHaveText(project.title);
  106 |       await expect(page.locator('main')).toContainText(project.summary);
  107 |       await expect(page.locator('button')).toHaveCount(0);
  108 |       for (const href of ['/work', '/blog', '/resume', '/contact']) {
  109 |         await expect(page.locator(`header a[href="${href}"]`).first()).toBeVisible();
  110 |       }
  111 |     }
  112 |     await page.goto('http://127.0.0.1:4197/work/sharecli');
  113 |     await expect(page.locator('#construction-continue')).toHaveAttribute('href', '#construction-entered');
  114 |     await page.locator('#construction-continue').click();
  115 |     await expect(page.locator('#construction-gate')).toBeHidden();
  116 |     const pending = page.waitForEvent('download');
  117 |     await page.locator('a[download]').first().click();
  118 |     expect((await pending).suggestedFilename()).toBe('sharecli-help-real.cast');
  119 |   } finally { await context.close(); }
  120 | });
  121 | 
  122 | test('top-level navigation pages have no-JavaScript content and clean links', async ({ browser }) => {
  123 |   const context = await browser.newContext({ javaScriptEnabled: false });
  124 |   const page = await context.newPage();
  125 |   const pages = [
  126 |     ['/', 'Software systems, technical products, and the infrastructure between them.'],
  127 |     ['/engineering', 'Software systems, technical products, and the infrastructure between them.'],
  128 |     ['/product', 'Software systems, technical products, and the infrastructure between them.'],
  129 |     ['/work', 'Work'],
  130 |     ['/resume', 'Two ways to read the work'],
  131 |     ['/contact', 'Let’s build something consequential.'],
  132 |     ['/blog', 'Writing'],
  133 |   ];
  134 |   try {
  135 |     for (const [path, heading] of pages) {
  136 |       await page.goto(`http://127.0.0.1:4197${path}`);
  137 |       await expect(page.locator('main h1')).toHaveText(heading);
  138 |       for (const href of ['/work', '/blog', '/resume', '/contact']) {
  139 |         await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
  140 |       }
  141 |     }
  142 |     await page.goto('http://127.0.0.1:4197/blog');
  143 |     await expect(page.locator('main a[href="/blog/why-we-forked-omniroute"]')).toBeVisible();
  144 |   } finally { await context.close(); }
  145 | });
  146 | 
  147 | test('published blog posts have no-JavaScript content and clean navigation', async ({ browser }) => {
  148 |   const context = await browser.newContext({ javaScriptEnabled: false });
  149 |   const page = await context.newPage();
  150 |   try {
  151 |     for (const post of POSTS) {
  152 |       await page.goto(`http://127.0.0.1:4197/blog/${post.slug}`);
  153 |       await expect(page.locator('main h1')).toHaveText(post.title);
  154 |       await expect(page.locator('main')).toContainText(post.excerpt);
  155 |       await expect(page.locator('button')).toHaveCount(0);
  156 |       await expect(page.locator('main footer.post-footer a')).toHaveAttribute('href', '/blog');
  157 |       for (const href of ['/work', '/blog', '/resume', '/contact']) {
  158 |         await expect(page.locator(`header a[href="${href}"]`).first()).toBeVisible();
  159 |       }
  160 |     }
  161 |   } finally { await context.close(); }
  162 | });
  163 | 
  164 | test('ShareCLI desktop and mobile accessibility', async ({ page }, testInfo) => {
  165 |   for (const width of [1440, 1280, 768, 390, 375]) {
  166 |     await page.setViewportSize({ width, height: 900 });
> 167 |     await page.goto('/work/sharecli');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4197/work/sharecli
  168 |   await dismissConstructionGate(page);
  169 |     await expect(page.locator('main h1')).toHaveText('ShareCLI');
  170 |     const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  171 |     await testInfo.attach(`axe-${width}`, { body: JSON.stringify(result.violations), contentType: 'application/json' });
  172 |     expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.length }))).toEqual([]);
  173 |     const overflow = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0,80) })));
  174 |     expect(overflow, `overflow at ${width}px`).toEqual([]);
  175 |   }
  176 | });
  177 | 
```