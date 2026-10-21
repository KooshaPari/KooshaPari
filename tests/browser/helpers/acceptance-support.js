// Shared setup for the Playwright acceptance suite.
//
// The suite lives in one directory (playwright.config.js sets
// testDir: './tests/browser') and is split across several spec files by
// concern. This module holds only what more than one spec file needs, so each
// spec imports exactly what it uses and a change to the preview origin or the
// shared portfolio records is made in one place.

export const BASE = 'http://127.0.0.1:4197';

export { PROJECTS } from '../../../data/projects.js';
export { POSTS } from '../../../data/posts.js';
