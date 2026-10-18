import { test, expect, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';

const blockedResource = 'https://math-rendering-fixture.invalid/untrusted-tex.png';
const maths = String.raw`### Synthetic maths fixture

Private browser fixture. This is not reviewed course material.

Inline fraction and power: $x^2 + \frac{1}{2}$.

Display fraction:

$$
\frac{x^2+1}{x+1}
$$

Matrix:

$$
\begin{pmatrix}1 & 2 \\ 3 & 4\end{pmatrix}
$$

Untrusted external-resource command:

$\includegraphics{https://math-rendering-fixture.invalid/untrusted-tex.png}$`;

async function harness(page: Page) {
  const id = '8f8cf4bd-b95b-4384-93bb-577485383c43';
  const user = { id, aud: 'authenticated', role: 'authenticated', email: 'maths@example.test',
    email_confirmed_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { username: 'mathsfixture', board: 'IB_MYP', grade: 10, subjects: ['Mathematics'] },
  };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:id,exp:2103836400,role:'authenticated'})}.fixture-signature`;
  const resourceAttempts: string[] = [];
  const generatedModes: string[] = [];
  const artifacts = new Map<string, Record<string, unknown>>();
  page.on('request', request => { if (request.url().includes('math-rendering-fixture.invalid')) resourceAttempts.push(request.url()); });
  // Keep all nonlocal traffic inside fixtures, including the deliberately hostile TeX URL.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return ['127.0.0.1','localhost'].includes(url.hostname) ? route.continue() : route.abort('blockedbyclient');
  });
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//, route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/auth/v1/token') return route.fulfill({json:{access_token:token,refresh_token:'fixture-refresh',expires_in:86400,token_type:'bearer',user}});
    if (path === '/auth/v1/user') return route.fulfill({json:user});
    if (path === '/auth/v1/logout') return route.fulfill({status:204,body:''});
    if (path === '/rest/v1/profiles') return route.fulfill({json:{...user,full_name:'Maths fixture'}});
    return route.fulfill({status:400,json:{error:'Unexpected fixture request'}});
  });
  await page.route('**/_vercel/**', route => route.fulfill({contentType:'application/javascript',body:''}));
  await page.route('https://va.vercel-scripts.com/**', route => route.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/api/**', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/api/waitlist-status') return route.fulfill({json:{status:'approved',access:true}});
    if (url.pathname === '/api/user-content') {
      if (request.method() === 'POST' || request.method() === 'PUT') {
        const write = request.postDataJSON();
        const item = { ...write, id: write.id ?? 'ea5aa4b4-325a-4ed5-b515-d486bf198dfb',
          created_at: write.created_at ?? new Date().toISOString(), updated_at: new Date().toISOString() };
        artifacts.set(item.id, item);
        return route.fulfill({json:{ok:true,item}});
      }
      const kind = url.searchParams.get('kind');
      return route.fulfill({json:{items:[...artifacts.values()].filter(item => !kind || item.kind === kind),nextOffset:null}});
    }
    if (url.pathname === '/api/notebook') {
      const body = request.postDataJSON();
      generatedModes.push(body.mode);
      return route.fulfill({json:{mode:body.mode,title:'Synthetic maths fixture',generatedAt:new Date().toISOString(),content:maths,
        sources:body.sources.map((source: {id: string; title: string})=>({id:source.id,title:source.title}))}});
    }
    return route.fulfill({json:{ok:true,items:[],nextOffset:null,isAdmin:false}});
  });
  return { resourceAttempts, generatedModes };
}

for (const width of [1440,1024,390]) test(`private notebook maths rendering and untrusted TeX at ${width}`, async ({page}, info) => {
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  const state = await harness(page);
  await page.goto('/login');
  await page.getByLabel('Email address',{exact:true}).fill('maths@example.test');
  await page.getByLabel('Password',{exact:true}).fill('fixture-password');
  await page.getByRole('button',{name:'Log in',exact:true}).click();
  await expect(page).toHaveURL(/\/main$/);
  await page.goto('/study-notebook');
  await page.getByRole('button',{name:'Create notebook',exact:true}).click();
  await page.getByLabel('Source title',{exact:true}).fill('Private synthetic maths source');
  await page.getByLabel('Source content',{exact:true}).fill('Synthetic source for rendering checks: fractions, powers and a two-by-two matrix. This is not approved course content.');
  await page.getByRole('button',{name:'Add',exact:true}).click();
  await page.getByRole('button',{name:'Study Guide',exact:true}).click();
  const generate = page.getByRole('button',{name:'Generate',exact:true});
  await generate.focus();
  await page.keyboard.press('Enter');
  const output = page.getByRole('region',{name:'Generated Study Guide',exact:true});
  await expect(output.getByRole('heading',{name:'Synthetic maths fixture',exact:true})).toBeVisible();
  expect(state.generatedModes).toEqual(['study-guide']);

  // This is the actual NotebookOutputPanel -> ChatMarkdown renderer, not injected DOM.
  await expect(output.locator('.katex-mathml math mfrac')).toHaveCount(2);
  await expect(output.locator('.katex-mathml math mtable')).toHaveCount(1);
  expect(await output.locator('.katex-mathml math msup').count()).toBeGreaterThanOrEqual(2);
  const annotations = await output.locator('annotation[encoding="application/x-tex"]').allTextContents();
  expect(annotations).toContain(String.raw`x^2 + \frac{1}{2}`);
  expect(annotations.some(value=>value.includes(String.raw`\begin{pmatrix}`))).toBe(true);
  expect(await output.locator('.katex-html[aria-hidden="true"]').count()).toBeGreaterThanOrEqual(3);
  await expect(output.locator('img, mglyph, iframe')).toHaveCount(0);
  await expect(output.locator(`[src="${blockedResource}"], [href="${blockedResource}"]`)).toHaveCount(0);

  for (const theme of ['light','dark'] as const) {
    await selectTheme(page,theme);
    const fontFamilies = await page.evaluate(async () => {
      await document.fonts.ready;
      const loaded: string[] = [];
      document.fonts.forEach(face => { if (face.status === 'loaded') loaded.push(face.family.replace(/["']/g,'')); });
      return loaded;
    });
    expect(fontFamilies).toContain('KaTeX_Main');
    expect(fontFamilies).toContain('KaTeX_Math');
    const rejectedContrast = await output.locator('.katex-html').evaluateAll(roots => {
      let token: Element | null = null;
      for (const root of roots) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          if (walker.currentNode.textContent === String.raw`\includegraphics`) token = walker.currentNode.parentElement;
        }
      }
      if (!token) throw new Error('The rejected TeX token is missing from the visible maths renderer.');
      const rgba = (value: string) => {
        if (!/^rgba?\(/.test(value)) throw new Error(`Unsupported computed colour: ${value}`);
        const parts = value.match(/[\d.]+/g)!.map(Number);
        return [parts[0], parts[1], parts[2], parts[3] ?? 1];
      };
      const foreground = rgba(getComputedStyle(token).color);
      const background = [0,0,0];
      let opacity = 0;
      const surfaces: string[] = [];
      // Composite transparent ancestor backgrounds until an actual opaque
      // surface is found; never assume white or substitute a theme token.
      for (let ancestor: Element | null = token; ancestor && opacity < 1; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (style.backgroundImage !== 'none' || Number(style.opacity) !== 1) {
          throw new Error('Maths contrast needs a flat surface without group opacity.');
        }
        const colour = rgba(style.backgroundColor);
        const weight = (1-opacity)*colour[3];
        for (let channel = 0; channel < 3; channel += 1) background[channel] += colour[channel]*weight;
        opacity += weight;
        if (weight > 0) surfaces.push(style.backgroundColor);
      }
      if (opacity !== 1) throw new Error('No opaque ancestor background found for rejected maths text.');
      const textColour = background.map((value,index) => foreground[index]*foreground[3]+value*(1-foreground[3]));
      const luminance = (colour: number[]) => colour.map(value => {
        const normal = value/255;
        return normal <= .04045 ? normal/12.92 : ((normal+.055)/1.055)**2.4;
      }).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
      const textLuminance = luminance(textColour), backgroundLuminance = luminance(background);
      return { foreground, background, surfaces,
        ratio:(Math.max(textLuminance,backgroundLuminance)+.05)/(Math.min(textLuminance,backgroundLuminance)+.05) };
    });
    expect(rejectedContrast.ratio,`${theme} rejected TeX contrast: ${JSON.stringify(rejectedContrast)}`).toBeGreaterThanOrEqual(4.5);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
    expect(await output.evaluate(element=>element.scrollWidth <= element.clientWidth+1)).toBe(true);
    expect(await output.locator('.katex-html').evaluateAll(elements => elements.every(element => {
      const math = element.getBoundingClientRect();
      const region = element.closest('.notebook-output')!.getBoundingClientRect();
      return math.left >= region.left-1 && math.right <= region.right+1;
    }))).toBe(true);
    await output.scrollIntoViewIfNeeded();
    await output.evaluate(element => {
      const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      window.scrollBy({top:element.getBoundingClientRect().top-headerBottom-16,behavior:'instant'});
    });
    await output.screenshot({path:info.outputPath(`maths-${width}-${theme}.png`),animations:'disabled'});
    await page.screenshot({path:info.outputPath(`maths-page-${width}-${theme}.png`),animations:'disabled'});

    // A real toast can cover content while visible. Close it with its own
    // control, or allow an already-expiring toast to finish before footer hits.
    const readyToast = page.getByRole('region',{name:'Notifications (F8)',exact:true})
      .getByRole('listitem').filter({hasText:'Study Guide ready'});
    if (await readyToast.isVisible()) {
      try { await readyToast.locator('button[toast-close]').click({timeout:1500}); }
      catch (error) { if (await readyToast.isVisible()) throw error; }
    }
    await expect(readyToast).toHaveCount(0,{timeout:8000});
    // The real footer must remain usable when optional companion controls are on.
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
    const launcher = page.getByRole('button',{name:'Open Apex study shortcuts',exact:true});
    await expect(launcher).toHaveClass(/vee-docked/);
    const controls = footer.locator('a, button:not([disabled])');
    for (let index = 0; index < await controls.count(); index += 1) {
      const control = controls.nth(index);
      await control.scrollIntoViewIfNeeded();
      const hit = await control.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const target = document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
        return { label:element.textContent?.trim(), reachable:target===element || element.contains(target),
          target:target ? `${target.tagName}#${target.id}.${target.className}` : null };
      });
      expect(hit,JSON.stringify(hit)).toMatchObject({reachable:true});
    }
    await launcher.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog',{name:'Think it through.'})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(launcher).toBeFocused();
    const returnedFocusStyle = await launcher.evaluate(element => {
      const style = getComputedStyle(element);
      const channels = /^rgba?\(/.test(style.outlineColor)
        ? style.outlineColor.match(/[\d.]+/g)!.map(Number)
        : [];
      return {
        focused: document.activeElement === element,
        focusVisible: element.matches(':focus-visible'),
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
        outlineColor: style.outlineColor,
        outlineAlpha: channels.length >= 3 ? (channels[3] ?? 1) : 0,
      };
    });
    const focusDetails = `${width}px ${theme} Apex return-focus indicator: ${JSON.stringify(returnedFocusStyle)}`;
    expect(returnedFocusStyle, focusDetails).toMatchObject({ focused: true, outlineStyle: 'solid' });
    expect(returnedFocusStyle.outlineWidth, focusDetails).toBeGreaterThanOrEqual(2);
    expect(returnedFocusStyle.outlineAlpha, focusDetails).toBeGreaterThan(0);
    const feedback = page.getByRole('button',{name:'Give VertexED feedback',exact:true});
    await feedback.scrollIntoViewIfNeeded();
    expect(await feedback.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const target = document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
      return target===element || element.contains(target);
    })).toBe(true);
    await page.screenshot({path:info.outputPath(`maths-footer-${width}-${theme}.png`),animations:'disabled'});
  }
  expect(state.resourceAttempts).toEqual([]);
});
