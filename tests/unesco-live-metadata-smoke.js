#!/usr/bin/env node
'use strict';

// Live smoke test exercises the same extraction function used by the feed workflow.
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const { extractOriginalPublicationDate } = require('../automation/unesco-publication-date');

const newsroomUrl = 'https://www.unesco.org/en/newsroom';
const userAgent = 'PacificEducationPilot/1.0 (educational current-affairs feed)';

function fetchHtml(url) {
  return execFileSync('curl', [
    '--silent', '--show-error', '--fail', '--location',
    '--connect-timeout', '8', '--max-time', '15',
    '--user-agent', userAgent,
    '--header', 'Accept: text/html',
    url
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 2 * 1024 * 1024 });
}

// Unit/regression cases run before making network requests.
assert.equal(extractOriginalPublicationDate(
  '<script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2024-02-29T10:00:00Z"}</script>'
), '2024-02-29');
assert.equal(extractOriginalPublicationDate(
  '<script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2024-02-29T10:00:00Z"}--!></script>'
), '2024-02-29', 'support JSON-LD blocks closed with the HTML --!> comment terminator');
assert.equal(extractOriginalPublicationDate(
  '<script type="application/ld+json"><!--{"@type":"NewsArticle","datePublished":"2024-02-29T10:00:00Z"}--!></script>'
), '2024-02-29', 'support JSON-LD wrapped in HTML comments using --!>');
assert.equal(extractOriginalPublicationDate(
  '<script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2023-02-29T10:00:00Z"}</script>'
), null);
assert.equal(extractOriginalPublicationDate(
  '<script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2024-02-31T10:00:00Z"}</script>'
), null);
assert.equal(extractOriginalPublicationDate(
  '<script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2026-10-10T00:30:00+14:00"}</script>'
), '2026-10-10', 'preserve the publisher calendar date across timezone offsets');
assert.equal(extractOriginalPublicationDate(
  '<script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2024-01-10T10:00:00Z"}</script>' +
  '<script type="application/ld+json">{"@type":"Organization","datePublished":"2020-01-01T00:00:00Z"}</script>'
), '2024-01-10', 'ignore unrelated organization metadata');
assert.equal(extractOriginalPublicationDate(
  '<script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2024-01-10T10:00:00Z"}</script>' +
  '<script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2024-01-11T10:00:00Z"}</script>'
), null, 'reject conflicting article publication dates');
assert.equal(extractOriginalPublicationDate(
  '<meta property="article:published_time" content="2024-03-01T08:00:00Z">'
), '2024-03-01', 'allow publisher meta fallback when typed article metadata is absent');
assert.equal(extractOriginalPublicationDate('<html><body>No publication metadata</body></html>'), null);

const newsroom = fetchHtml(newsroomUrl);
const candidates = new Set();
for (const match of newsroom.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
  const href = match[1].replace(/&amp;/g, '&');
  if (!/^(?:https:\/\/www\.unesco\.org)?\/(?:en\/)?(?:articles|news|press-releases|statements|press-invitations)\//i.test(href)) continue;
  try {
    const url = new URL(href, 'https://www.unesco.org').toString();
    if (new URL(url).hostname === 'www.unesco.org') candidates.add(url);
  } catch (_) { /* Ignore malformed newsroom links. */ }
}

if (!candidates.size) throw new Error('UNESCO newsroom returned no recognizable article links.');
let checked = 0;
let accepted = 0;
for (const url of [...candidates].slice(0, 12)) {
  checked++;
  try {
    const html = fetchHtml(url);
    const publicationDate = extractOriginalPublicationDate(html);
    if (publicationDate) {
      accepted++;
      console.log('PASS: primary article publication date validated for ' + url + ' (' + publicationDate + ')');
      break;
    }
    console.warn('SKIP: missing, invalid, or conflicting primary article publication metadata: ' + url);
  } catch (error) {
    console.warn('SKIP: UNESCO article could not be fetched (' + String(error.message || error) + '): ' + url);
  }
}
if (!accepted) {
  throw new Error('Live UNESCO smoke test failed: no article among ' + checked +
    ' newsroom links exposed valid original publication metadata.');
}
console.log('UNESCO live metadata smoke test passed; checked ' + checked +
  ' article page(s), validated ' + accepted + ' real article page(s).');
