import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const eventHandler = require('../api/event.js');
const cspHandler = require('../api/csp-report.js');

const invoke = (handler, request) => {
  const response = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    end() {
      return this;
    }
  };
  handler(request, response);
  return response;
};

const originalLog = console.log;
const originalWarn = console.warn;
console.log = () => {};
console.warn = () => {};

try {
  assert.equal(invoke(eventHandler, { method: 'GET', headers: {} }).statusCode, 405);
  assert.equal(invoke(eventHandler, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: {} }).statusCode, 415);
  assert.equal(invoke(eventHandler, { method: 'POST', headers: { 'content-type': 'application/json' }, body: { event: 'invalid' } }).statusCode, 400);
  assert.equal(invoke(eventHandler, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': 'test-success' }, body: { event: 'store_open' } }).statusCode, 204);

  let eventRateStatus = 0;
  for (let index = 0; index < 31; index += 1) {
    eventRateStatus = invoke(eventHandler, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': 'test-rate' }, body: { event: 'store_open' } }).statusCode;
  }
  assert.equal(eventRateStatus, 429);

  assert.equal(invoke(cspHandler, { method: 'POST', headers: { 'content-type': 'application/csp-report', 'x-forwarded-for': 'test-csp' }, body: { 'csp-report': { 'violated-directive': 'script-src', 'blocked-uri': 'https://example.com/a.js' } } }).statusCode, 204);
  assert.equal(invoke(cspHandler, { method: 'POST', headers: { 'content-type': 'application/reports+json', 'x-forwarded-for': 'test-reporting' }, body: [{ body: { effectiveDirective: 'script-src', blockedURL: 'https://example.com/a.js' } }] }).statusCode, 204);
} finally {
  console.log = originalLog;
  console.warn = originalWarn;
}

console.log('APIs validadas.');
