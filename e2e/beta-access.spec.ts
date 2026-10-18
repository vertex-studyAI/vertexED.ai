import { test, expect, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';

async function harness(page: Page, initial = 'approved') {
  let status = initial;
  let checks = 0;
  const user = { id: '01a142ca-34d6-4a10-9c2f-2b89b678dbeb', aud: 'authenticated', role: 'authenticated', email: 'access@example.test', email_confirmed_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { username: 'accessfixture', board: 'IB_MYP', grade: 10, subjects: ['Physics'] } };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,exp:2103836400,role:'authenticated'})}.fixture-signature`;
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/auth/v1/token') return route.fulfill({json:{access_token:token,refresh_token:'fixture-refresh',expires_in:86400,token_type:'bearer',user}});
    if (path === '/auth/v1/user') return route.fulfill({json:user});
    if (path === '/auth/v1/logout') return route.fulfill({status:204,body:''});
    if (path === '/rest/v1/profiles') return route.fulfill({json:{...user,full_name:'Access fixture'}});
    return route.fulfill({status:400,json:{error:'Unexpected fixture request'}});
  });
  await page.route('**/_vercel/**', route => route.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/api/**', route => {
    if (new URL(route.request().url()).pathname === '/api/waitlist-status') {
      checks++;
      if (status === 'html') return route.fulfill({contentType:'text/html',body:'<html>Unexpected upstream page</html>'});
      if (status === 'rate') return route.fulfill({status:429,headers:{'Retry-After':'3'},json:{error:'Rate limited'}});
      if (status === 'outage') return route.fulfill({status:503,headers:{'Retry-After':'1'},json:{error:'Private dependency detail'}});
      return route.fulfill({json:{status,access:status==='approved'}});
    }
    return route.fulfill({json:{ok:true,items:[],nextOffset:null,isAdmin:false}});
  });
  return { set: (next: string) => {status=next;}, checks: () => checks, user, token };
}

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email address', {exact:true}).fill('access@example.test');
  await page.getByLabel('Password', {exact:true}).fill('fixture-password');
  await page.getByRole('button', {name:'Log in',exact:true}).click();
  await expect(page).toHaveURL(/\/main$/);
}

for (const width of [1440,1024,390]) test(`access outage recovery, keyboard and themes at ${width}`, async ({page}, info) => {
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  const state = await harness(page,'html');
  await login(page);
  await expect(page.getByRole('heading',{name:'We could not verify your access'})).toBeVisible();
  await expect(page.getByText('The account service returned an unexpected page.',{exact:false})).toBeVisible();
  for (const theme of ['light','dark'] as const) {
    await selectTheme(page,theme);
    await expect.poll(() => page.getByRole('button',{name:'Try again',exact:true}).evaluate(button => {
      const style = getComputedStyle(button);
      const luminance = (colour: string) => {
        const rgb = (colour.match(/[\d.]+/g) || []).slice(0,3).map(Number).map(channel => {const c=channel/255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;});
        return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2];
      };
      const text = luminance(style.color); const background = luminance(style.backgroundColor);
      return (Math.max(text,background)+0.05)/(Math.min(text,background)+0.05);
    })).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({path:info.outputPath(`access-${width}-${theme}.png`),animations:'disabled',fullPage:true});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
    const controls = ['Privacy', 'Terms', 'Support', 'Privacy request', 'Contact'].map(name => ({ name, control: page.locator('footer').getByRole('link', { name, exact: true }) }));
    controls.push({ name: 'Feedback', control: page.getByRole('button', { name: 'Give VertexED feedback', exact: true }) });
    for (const { name, control: link } of controls) {
      await link.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await expect.poll(() => link.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        if (target === element || element.contains(target)) return 'reachable';
        return JSON.stringify({ target: target?.outerHTML.slice(0, 220), rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } });
      }), { message: `${name} stays reachable above fixed navigation and optional controls` }).toBe('reachable');
    }
    await page.screenshot({path:info.outputPath(`access-footer-${width}-${theme}.png`),animations:'disabled'});
  }
  state.set('pending');
  await page.getByRole('button',{name:'Try again',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Your access is pending'})).toBeVisible();
  await page.getByRole('link',{name:'Account and data controls'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button',{name:'Export Account Data',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Delete Account',exact:true})).toBeVisible();
});

test('rate-limit cooldown stops retries and unknown state never becomes approval', async ({page}) => {
  const state = await harness(page,'rate');
  await login(page);
  await expect(page.getByRole('button',{name:/Try again in/})).toBeDisabled();
  const before = state.checks();
  await page.waitForTimeout(1000);
  expect(state.checks()).toBe(before);
  state.set('unknown');
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.getByRole('heading',{name:'We could not verify your access'})).toBeVisible();
  state.set('revoked');
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Access is not approved'})).toBeVisible();
});

test('approved access is rechecked without dropping a draft and revocation replaces the product', async ({page}) => {
  const state = await harness(page);
  await page.clock.install();
  await login(page);
  await page.goto('/study-zone?focus=timer');
  const notes = page.getByRole('textbox',{name:'Session notes',exact:true});
  await notes.fill('Keep the current study draft');
  const before = state.checks();
  await page.clock.fastForward(61_000);
  await expect.poll(state.checks).toBeGreaterThan(before);
  await expect(notes).toHaveValue('Keep the current study draft');
  state.set('revoked');
  await page.clock.fastForward(61_000);
  await expect(page.getByRole('heading',{name:'Access is not approved'})).toBeVisible();
  await expect(notes).toHaveCount(0);
});

test('verification required is distinct from approval and outage', async ({page}) => {
  await harness(page,'verification_required');
  await login(page);
  await expect(page.getByRole('heading',{name:'Verify your email',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Go to sign in'})).toBeVisible();
});

test('created account with failed sign-in offers recovery and clears password', async ({page}) => {
  await harness(page);
  await page.route('**/api/signup-invite',route=>route.fulfill({json:route.request().postDataJSON().action === 'validateInvite' ? {ok:true,email:'access@example.test'} : {ok:true,requiresEmailVerification:false}}));
  await page.route('**/auth/v1/token**',route=>route.fulfill({status:400,json:{error:'invalid_grant',error_description:'Invalid login credentials'}}));
  await page.goto('/signup?invite=synthetic-not-a-real-token');
  await expect(page).toHaveURL(/\/signup$/);
  await page.getByLabel('Username',{exact:true}).fill('accessfixture');
  await page.getByLabel('Password',{exact:true}).fill('FixturePassword2026');
  await page.getByRole('button',{name:'Create account',exact:true}).click();
  await expect(page.getByText('Your account was created',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Sign in or reset password'})).toBeVisible();
  await expect(page.getByLabel('Password',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Create account',exact:true})).toHaveCount(0);
});

test('invalid approval link can return to a usable waitlist form after URL scrubbing', async ({page}) => {
  await harness(page);
  await page.route('**/api/signup-invite',route=>route.fulfill({status:400,json:{error:'Invalid or expired invitation'}}));
  await page.goto('/signup?invite=synthetic-expired-token');
  await expect(page).toHaveURL(/\/signup$/);
  await page.getByRole('button',{name:'Return to waitlist',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Join the waitlist',exact:true})).toBeVisible();
  await expect(page.getByLabel('Email address',{exact:true})).toBeEditable();
  await expect(page.getByLabel('Password',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Join waitlist',exact:true})).toBeEnabled();
});

test('finishing signup sign-in cannot pull a learner back from a route they chose', async ({page}) => {
  const fixture = await harness(page);
  let finishSignIn!: () => void;
  const pending = new Promise<void>(resolve => {finishSignIn = resolve;});
  await page.route('**/api/signup-invite',route=>route.fulfill({json:route.request().postDataJSON().action === 'validateInvite' ? {ok:true,email:'access@example.test'} : {ok:true,requiresEmailVerification:false}}));
  await page.route('**/auth/v1/token**',async route => {
    await pending;
    await route.fulfill({json:{access_token:fixture.token,refresh_token:'fixture-refresh',expires_in:86400,token_type:'bearer',user:fixture.user}});
  });
  await page.goto('/signup?invite=synthetic-pending-token');
  await page.getByLabel('Username',{exact:true}).fill('accessfixture');
  await page.getByLabel('Password',{exact:true}).fill('FixturePassword2026');
  await page.getByRole('button',{name:'Create account',exact:true}).click();
  await expect(page.getByText('Signing you in...',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Sign in or reset password'})).toHaveCount(0);
  await page.getByRole('link',{name:'Privacy',exact:true}).first().click();
  await expect(page).toHaveURL(/\/privacy$/);
  const response = page.waitForResponse(/\/auth\/v1\/token/);
  finishSignIn();
  await response;
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(/\/privacy$/);
});
