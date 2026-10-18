import { test, expect, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';

// Synthetic service responses only. These tests do not exercise a deployed spend ledger.
function usage(remainingMicros = 700_000) {
  const startsAt = Math.floor(Date.now() / 86_400_000) * 86_400_000;
  return {
    currency: 'USD', policyVersion: 'beta-usd-2026-10-16-v1',
    period: { startsAt: new Date(startsAt).toISOString(), resetsAt: new Date(startsAt + 86_400_000).toISOString(), timeZone: 'UTC' },
    account: { limitMicros: 1_000_000, usedMicros: 900_000 - remainingMicros, reservedMicros: 100_000, remainingMicros, carriedReservedMicros: 0 },
    project: { available: true }, concurrency: { accountLimit: 2, accountActive: 1, accountUncertain: 0, accountBlocked: false },
  };
}

async function harness(page: Page, membership = 'pending') {
  const makeUser = (id: string, email: string) => ({ id, email, aud: 'authenticated', role: 'authenticated',
    email_confirmed_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { username: email.split('@')[0], onboardingCompleted: true, board: 'IB_MYP', grade: 10, subjects: ['Physics'] },
  });
  const a = makeUser('01a142ca-34d6-4a10-9c2f-2b89b678dbea', 'usage-a@example.test');
  const b = makeUser('01a142ca-34d6-4a10-9c2f-2b89b678dbeb', 'usage-b@example.test');
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const tokenFor = (id: string) => `${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:id,exp:2103836400,role:'authenticated'})}.fixture-signature`;
  let user = a;
  let mode: 'ready' | 'unavailable' | 'exhausted' | 'project' | 'carried' = 'ready';
  let checks = 0;
  let holdA = false;
  let held = false;
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/auth/v1/token') return route.fulfill({json:{access_token:tokenFor(user.id),refresh_token:`fixture-${user.id}`,expires_in:86400,token_type:'bearer',user}});
    if (path === '/auth/v1/user') return route.fulfill({json:user});
    if (path === '/auth/v1/logout') return route.fulfill({status:204,body:''});
    if (path === '/rest/v1/profiles') return route.fulfill({json:{...user,full_name:'Usage fixture'}});
    return route.fulfill({status:400,json:{error:'Unexpected fixture request'}});
  });
  await page.route('**/_vercel/**', route => route.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/waitlist-status') return route.fulfill({json:{status:membership,access:membership==='approved'}});
    if (path === '/api/ai-usage') {
      checks++;
      const accountA = route.request().headers().authorization === `Bearer ${tokenFor(a.id)}`;
      if (holdA && accountA) { held = true; await pending; }
      if (mode === 'unavailable') return route.fulfill({status:503,json:{code:'AI_USAGE_UNAVAILABLE',error:'AI usage is temporarily unavailable.'}}).catch(() => {});
      const value = usage(mode === 'exhausted' ? 0 : accountA ? 700_000 : 400_000);
      value.project.available = mode !== 'project';
      if (mode === 'carried') {
        value.account.carriedReservedMicros = 500_000;
        value.concurrency = { accountLimit: 2, accountActive: 2, accountUncertain: 1, accountBlocked: true };
      }
      return route.fulfill({headers:{'Cache-Control':'private, no-store'},json:value}).catch(() => {});
    }
    return route.fulfill({json:{ok:true,items:[],nextOffset:null,isAdmin:false}});
  });
  return { set: (next: typeof mode) => {mode=next;}, checks: () => checks, switchToB: () => {user=b;},
    holdA: () => {holdA=true;}, held: () => held, release, email: () => user.email };
}

async function login(page: Page, email: string, expectedReturnPath: '/main' | '/user-settings' = '/main') {
  if (expectedReturnPath === '/user-settings') {
    // Keep the guarded sign-out redirect and its history state in this document.
    // Reloading /login discards the in-flight account-A request under test.
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect.poll(() => page.evaluate(() => window.history.state?.usr?.from), {
      message: 'The signed-out settings route supplies the explicit login return destination',
    }).toBe('/user-settings');
  } else await page.goto('/login');
  await page.getByLabel('Email address',{exact:true}).fill(email);
  await page.getByLabel('Password',{exact:true}).fill('fixture-password');
  await page.getByRole('button',{name:'Log in',exact:true}).click();
  await expect(page).toHaveURL(url => url.pathname === expectedReturnPath);
  if (expectedReturnPath !== '/user-settings') await page.goto('/user-settings');
  await expect(page.getByRole('heading',{name:'Account Settings',exact:true})).toBeVisible();
}

for (const width of [1440,1024,390]) test(`AI account usage, keyboard and themes at ${width}`, async ({page}, info) => {
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  const state = await harness(page);
  await login(page,state.email());
  const panel = page.getByRole('region',{name:'AI usage',exact:true});
  await expect(panel.getByText('USD 1.00',{exact:true})).toBeVisible();
  for (const amount of ['USD 0.20','USD 0.10','USD 0.70']) await expect(panel.getByText(amount,{exact:true})).toBeVisible();
  await expect(panel.getByText(/Daily reset:.*00:00 UTC/)).toBeVisible();
  await expect(panel.getByText(/awaiting a confirmed outcome remain reserved/)).toBeVisible();
  await expect(page.getByRole('button',{name:'Export Account Data',exact:true})).toBeEnabled();
  await expect(page.getByRole('button',{name:'Delete Account',exact:true})).toBeEnabled();
  for (const theme of ['light','dark'] as const) {
    await selectTheme(page,theme);
    await panel.scrollIntoViewIfNeeded();
    const refresh = panel.getByRole('button',{name:'Refresh AI usage',exact:true});
    await refresh.focus();
    await expect(refresh).toBeFocused();
    const before = state.checks();
    await page.keyboard.press('Enter');
    await expect.poll(state.checks).toBeGreaterThan(before);
    await expect(refresh).toBeEnabled();
    await expect(panel.getByText('USD 0.70',{exact:true})).toBeVisible();
    await panel.evaluate(element => window.scrollTo({
      top: window.scrollY + element.getBoundingClientRect().top - 140,
      behavior: 'instant',
    }));
    await expect.poll(() => panel.getByRole('heading', { name: 'AI usage', exact: true }).evaluate(element => {
      const rect = element.getBoundingClientRect();
      const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return target === element || element.contains(target);
    })).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
    await panel.screenshot({path:info.outputPath(`ai-usage-${width}-${theme}.png`),animations:'disabled'});
    await page.screenshot({path:info.outputPath(`ai-usage-page-${width}-${theme}.png`),animations:'disabled'});
    const offlineHeading = page.getByRole('heading', { name: 'Offline study', exact: true });
    await offlineHeading.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect.poll(() => offlineHeading.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return target === element || element.contains(target) ? 'reachable' : target?.outerHTML.slice(0, 220);
    })).toBe('reachable');
  }
});

test('usage outage, exhaustion and shared allowance preserve owner controls and retry', async ({page}, info) => {
  const state = await harness(page,'revoked'); state.set('unavailable');
  await login(page,state.email());
  const panel = page.getByRole('region',{name:'AI usage',exact:true});
  await expect(panel.getByRole('alert')).toContainText('AI usage is temporarily unavailable');
  await expect(panel.getByText('USD 0.00',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Export Account Data',exact:true})).toBeEnabled();
  await expect(page.getByRole('button',{name:'Delete Account',exact:true})).toBeEnabled();
  await panel.screenshot({path:info.outputPath('ai-usage-unavailable.png'),animations:'disabled'});
  state.set('exhausted');
  await panel.getByRole('button',{name:'Refresh AI usage',exact:true}).click();
  await expect(panel.getByRole('status')).toContainText('fully used or reserved');
  await expect(panel.locator('dl').first().getByText('USD 0.00',{exact:true})).toBeVisible();
  await panel.screenshot({path:info.outputPath('ai-usage-exhausted.png'),animations:'disabled'});
  state.set('project');
  await panel.getByRole('button',{name:'Refresh AI usage',exact:true}).click();
  await expect(panel.getByRole('status')).toContainText('shared AI allowance is unavailable');
  await expect(panel.getByText('USD 0.70',{exact:true})).toBeVisible();
  state.set('carried');
  await panel.getByRole('button',{name:'Refresh AI usage',exact:true}).click();
  await expect(panel.getByRole('status')).toContainText('held request must be resolved');
  await expect(panel.getByText('USD 0.50',{exact:true})).toBeVisible();
  await expect(panel.getByText(/still hold request slots after the daily reset/)).toBeVisible();
  await panel.screenshot({path:info.outputPath('ai-usage-carried-reservation.png'),animations:'disabled'});
  state.set('ready');
  await panel.getByRole('button',{name:'Refresh AI usage',exact:true}).click();
  await expect(panel.getByRole('status')).toContainText('allowance remaining');
});

test('late account A usage cannot replace account B balance after sign-out and sign-in', async ({page}) => {
  const state = await harness(page); state.holdA();
  try {
    await login(page,state.email(),'/main');
    await expect.poll(state.held).toBe(true);
    const documentTimeOrigin = await page.evaluate(() => performance.timeOrigin);
    await page.getByRole('button',{name:'Sign Out',exact:true}).click();
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page.getByLabel('Email address',{exact:true})).toBeVisible();
    await expect(page.getByLabel('Password',{exact:true})).toBeVisible();
    await expect(page.getByRole('region',{name:'AI usage',exact:true})).toHaveCount(0);
    state.switchToB();
    await login(page,state.email(),'/user-settings');
    expect(await page.evaluate(() => performance.timeOrigin), 'A and B must share the same document while the old A response is held').toBe(documentTimeOrigin);
    const panel = page.getByRole('region',{name:'AI usage',exact:true});
    await expect(panel.getByText('USD 0.40',{exact:true})).toBeVisible();
    state.release();
    await page.waitForTimeout(100);
    await expect(panel.getByText('USD 0.40',{exact:true})).toBeVisible();
    await expect(panel.getByText('USD 0.70',{exact:true})).toHaveCount(0);
  } finally { state.release(); }
});
