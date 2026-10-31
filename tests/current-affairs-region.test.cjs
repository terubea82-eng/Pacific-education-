'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { inferCurrentAffairsRegion } = require('../automation/current-affairs-region');

test('foreign event in a Fiji publisher headline is not mislabeled as Fiji', () => {
  assert.equal(
    inferCurrentAffairsRegion("Cyclone Arnab stalls close to India’s east coast", 'FIJI'),
    'GLOBAL'
  );
  assert.equal(
    inferCurrentAffairsRegion("Cyclone Arnab makes landfall in India’s Andhra Pradesh", 'GLOBAL'),
    'GLOBAL'
  );
  assert.equal(
    inferCurrentAffairsRegion('El Salvador to send over 2,000 soldiers to Haiti for rescue', 'FIJI'),
    'GLOBAL'
  );
  assert.equal(
    inferCurrentAffairsRegion('Haiti delays elections after security crisis', 'FIJI'),
    'GLOBAL'
  );
});

test('explicit UK and EU events in Fiji publisher feeds are classified globally', () => {
  assert.equal(
    inferCurrentAffairsRegion('King Charles sorrow over slavery faces test as reparations movement gains ground', 'FIJI'),
    'GLOBAL'
  );
  assert.equal(
    inferCurrentAffairsRegion('EU fees that hit cheap Shein, Temu parcels could raise €6 billion', 'FIJI'),
    'GLOBAL'
  );
});

test('explicit Fiji story location overrides a Pacific publisher fallback', () => {
  assert.equal(
    inferCurrentAffairsRegion('Fiji anti-corruption chief responds to drug investigation', 'PACIFIC'),
    'FIJI'
  );
  assert.equal(
    inferCurrentAffairsRegion('World Bank sets out what Fiji must change', 'GLOBAL'),
    'FIJI'
  );
});

test('Pacific story location remains Pacific when another region is mentioned', () => {
  assert.equal(
    inferCurrentAffairsRegion('Solomon Islands PM flown to Australia for urgent medical treatment', 'GLOBAL'),
    'PACIFIC'
  );
  assert.equal(
    inferCurrentAffairsRegion('Tokelau Language Week in Aotearoa', 'GLOBAL'),
    'PACIFIC'
  );
});

test('ambiguous headlines retain a valid publisher-region fallback', () => {
  assert.equal(inferCurrentAffairsRegion('Constitution bill faces crucial vote', 'FIJI'), 'FIJI');
  assert.equal(inferCurrentAffairsRegion('Climate change is a growing health emergency', 'GLOBAL'), 'GLOBAL');
  assert.equal(inferCurrentAffairsRegion('Unrecognized local headline', 'unknown'), 'GLOBAL');
});
