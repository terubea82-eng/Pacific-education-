#!/usr/bin/env node
'use strict';

// Live smoke test for UNESCO's real newsroom and article metadata.
// Mirrors the strict datePublished acceptance rule used by the feed workflow.
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');

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

function publicationValues(html) {
  const values = [...html.matchAll(/"datePublished"\s*:\s*"([^"]+)"/gi)]
    .map(match => match[1]);
  for (const tagMatch of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = tagMatch[0];
    const property = tag.match(/\bproperty\s*=\s*["']([^"']+)["']/i)?.[1];
    const name = tag.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1];
    const content = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1];
    if (content && [property, name].filter(Boolean)
      .some(key => /^(?:article:published_time|datePublished)$/i.test(key.trim()))) {
      values.push(content.trim());
    }
  }
  return values;
}

function validOriginalPublicationDate(values) {
  if (!values.length) return false;
  const parsed = values.map(value => {
    const text = String(value).trim();
    const match = text.match(/^(\d{4}-\d{2}-\d{2})(?:T|\s|$)/);
    const timestamp = Date.parse(text);
    if (!match || !Number.isFinite(timestamp)) return null;
    const day = Date.parse(match[1] + 'T00:00:00.000Z');
    if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== match[1]) return null;
    return { date: match[1], timestamp };
  });
  if (parsed.some(value => value === null)) return false;
  return new Set(parsed.map(value => value.date)).size === 1;
}

// Guard against JavaScript Date.parse normalizing impossible calendar dates.
assert.equal(validOriginalPublicationDate(['2024-02-29T10:00:00Z']), true);
assert.equal(validOriginalPublicationDate(['2023-02-29T10:00:00Z']), false);
assert.equal(validOriginalPublicationDate(['2024-02-31T10:00:00Z']), false);
assert.equal(validOriginalPublicationDate(['2024-01-10T10:00:00Z', '2024-01-11T10:00:00Z']), false);
assert.equal(validOriginalPublicationDate([]), false);

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
    const values = publicationValues(html);
    if (validOriginalPublicationDate(values)) {
      accepted++;
      console.log('PASS: original publication metadata validated for ' + url);
      break;
    }
    console.warn('SKIP: missing, invalid, or conflicting datePublished metadata: ' + url);
  } catch (error) {
    console.warn('SKIP: UNESCO article could not be fetched (' + String(error.message || error) + '): ' + url);
  }
}
if (!accepted) {
  throw new Error('Live UNESCO smoke test failed: no article among ' + checked +
    ' newsroom links exposed consistent, valid original datePublished metadata.');
}
console.log('UNESCO live metadata smoke test passed; checked ' + checked +
  ' article page(s), validated ' + accepted + ' real article page(s).');
