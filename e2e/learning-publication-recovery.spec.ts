import { expect, test, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';

const account = '01a142ca-34d6-4a10-9c2f-2b89b678dbeb';
const questionId = 'math-functions-composite-01';
const prefix = `vertex_content:${account}`;
const oldAttempt = { id: 'attempt:history-fixture-01', questionId, answer: '7', confidence: 4, hinted: false, seconds: 20, at: '2026-10-15T09:00:00Z', mode: 'diagnostic', correct: true, evidence: 'original-bank-answer-check-v1' };
const oldMistake = { id: 'mistake:history-fixture-01', questionId, cause: 'conceptual', reflection: 'I changed the order of the functions.', correction: 'Evaluate the inside function first.', updatedAt: '2026-10-15T09:00:00Z' };
const oldSession = { id: 'history-session-fixture', ids: [questionId], index: 0, mode: 'diagnostic', startedAt: 1792054800000, deadline: null, finished: false, responses: { [questionId]: { answer: '7', confidence: 4, hinted: false, seconds: 20, flagged: false } }, subject: 'Mathematics', topic: '', concept: '', curriculum: '' };
const rawCopies = { [`${prefix}:practice_attempts`]: JSON.stringify([oldAttempt]), [`${prefix}:practice_mistakes`]: JSON.stringify([oldMistake]), [`${prefix}:practice_session`]: JSON.stringify(oldSession) };

async function login(page: Page) {
  const user = { id: account, aud: 'authenticated', role: 'authenticated', email: 'history@example.test', email_confirmed_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { username: 'historyfixture', board: 'IB_MYP', grade: 10, subjects: ['Mathematics'] } };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:account,exp:2103836400,role:'authenticated'})}.fixture-signature`;
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname.endsWith('.supabase.co')) {
      if (url.pathname === '/auth/v1/token') return route.fulfill({json:{access_token:token,refresh_token:'fixture-refresh',expires_in:86400,token_type:'bearer',user}});
      if (url.pathname === '/auth/v1/user') return route.fulfill({json:user});
      if (url.pathname === '/rest/v1/profiles') return route.fulfill({json:{...user,full_name:'History fixture'}});
      return route.fulfill({json:{}});
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({json:{ok:true,status:'approved',access:true,items:[],nextOffset:null,isAdmin:false}});
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') return route.abort();
    return route.continue();
  });
  await page.goto('/login');
  await page.getByLabel('Email address',{exact:true}).fill(user.email);
  await page.getByLabel('Password',{exact:true}).fill('fixture-password');
  await page.getByRole('button',{name:'Log in',exact:true}).click();
  await expect(page).toHaveURL(/\/main$/);
}

for (const width of [1440,1024,390]) test(`held questions preserve history, answers and reflections at ${width}`, async ({page}, info) => {
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await login(page);
  await page.evaluate(copies => {for(const [key,raw] of Object.entries(copies)) localStorage.setItem(key,raw);},rawCopies);
  await page.goto('/learn');
  await expect(page.getByRole('heading',{name:'Saved session awaiting content review'})).toBeVisible();
  await expect(page.getByLabel('Your saved answers')).toHaveValue(/7/);
  await expect(page.getByRole('button',{name:'Start practice',exact:true})).toBeDisabled();
  await expect(page.getByText('Practice questions are awaiting subject review.',{exact:false})).toBeVisible();
  await expect(page.getByRole('button',{name:'Check answer',exact:true})).toHaveCount(0);
  for(const theme of ['light','dark'] as const) {
    await selectTheme(page,theme);
    await page.screenshot({path:info.outputPath(`held-practice-${width}-${theme}.png`),fullPage:true,animations:'disabled'});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
  }
  await page.getByRole('button',{name:'Progress',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('table')).toContainText('Awaiting content review');
  await expect(page.getByRole('table')).toContainText('7');
  await expect(page.getByText('0 / 0',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Mistakes',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Saved reflections awaiting content review'})).toBeVisible();
  await page.getByRole('heading',{name:'Saved reflections awaiting content review'}).locator('..').locator('summary').click();
  await expect(page.getByText(oldMistake.reflection,{exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:'Saved session awaiting content review'})).toBeVisible();
  await page.waitForTimeout(1500);
  const after = await page.evaluate(keys => Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])),Object.keys(rawCopies));
  expect(after).toEqual(rawCopies);
  await page.getByRole('link',{name:'Export your account data',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button',{name:'Export Account Data',exact:true})).toBeVisible();
});
