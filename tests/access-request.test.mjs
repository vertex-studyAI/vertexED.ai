import assert from 'node:assert/strict';
import test from 'node:test';
import { requestAccessJson, accessStateFromResponse, retryAfterSeconds, accessFailureMessage } from '../src/lib/accessRequest.mjs';

const response = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });
test('only recognised server approval admits a learner', () => {
  for (const data of [null, {}, {status:'active'}, ...[undefined, null, false, 'false', 0, 1].map(access => ({status:'approved',access}))]) assert.equal(accessStateFromResponse(data), 'unavailable');
  assert.equal(accessStateFromResponse({status:'approved',access:true}), 'approved');
  for (const status of ['revoked','rejected','unregistered']) assert.equal(accessStateFromResponse({status}), 'denied');
  assert.equal(accessStateFromResponse({status:'pending'}), 'pending');
  assert.equal(accessStateFromResponse({status:'verification_required'}), 'verification_required');
});
test('classifies transport, hosting HTML, corrupt JSON, session, cooldown and dependency failures without echoing bodies', async () => {
  const cases = [
    [() => Promise.reject(new TypeError('secret upstream body')), 'transport'],
    [() => new Response('<html>private upstream</html>', {headers:{'Content-Type':'text/html'}}), 'routing'],
    [() => new Response('{bad', {headers:{'Content-Type':'application/json'}}), 'response'],
    [() => response({},401), 'session'],
    [() => response({},429,{'Retry-After':'90'}), 'rate_limit'],
    [() => response({},503,{'Retry-After':'30'}), 'service'],
    [() => response([],200), 'response'],
  ];
  for (const [fetcher, kind] of cases) await assert.rejects(requestAccessJson('/api/waitlist-status',{}, {fetcher}), error => {
    assert.equal(error.kind, kind);
    assert.doesNotMatch(accessFailureMessage(error), /secret|private upstream/);
    if (kind === 'rate_limit') assert.equal(error.retryAfter,90);
    return true;
  });
});
test('bounds a stuck token lookup and a stalled response body with no retry', async () => {
  let calls = 0;
  await assert.rejects(requestAccessJson('/api/waitlist-status',{}, {timeoutMs:10,fetcher:() => { calls++; return new Promise(()=>{}); }}), {kind:'timeout'});
  assert.equal(calls,1);
  await assert.rejects(requestAccessJson('/api/waitlist-status',{}, {timeoutMs:10,fetcher:() => new Response(new ReadableStream({start(){}}),{headers:{'Content-Type':'application/json'}})}), {kind:'timeout'});
});
test('cancellation aborts transport and pre-aborted requests never start', async () => {
  const controller = new AbortController();
  let signal;
  const request = requestAccessJson('/api/waitlist-status',{signal:controller.signal},{fetcher:(_url, init) => {signal=init.signal;return new Promise(()=>{});}});
  controller.abort();
  await assert.rejects(request,{kind:'cancelled'});
  assert.equal(signal.aborted,true);
  await assert.rejects(requestAccessJson('/',{signal:controller.signal},{fetcher:()=>assert.fail('started cancelled request')}),{kind:'cancelled'});
});
test('supports server cooldown seconds and HTTP dates and does not cache access checks', async () => {
  assert.equal(retryAfterSeconds('Fri, 16 Oct 2026 10:00:30 GMT',Date.parse('2026-10-16T10:00:00Z')),30);
  assert.equal(retryAfterSeconds('bad'),0);
  const data = await requestAccessJson('/api/waitlist-status',{}, {fetcher:(_url,init)=>{assert.equal(init.cache,'no-store');return response({status:'approved'});}});
  assert.equal(data.status,'approved');
});
