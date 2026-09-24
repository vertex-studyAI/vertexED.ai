import { test, expect } from '@playwright/test';

test('working trace localises a real error, accepts a repair and abstains on unsupported work', async ({page})=>{
  const sent:string[]=[];
  page.on('request',r=>{if(r.url().includes('/api/')&&r.method()==='POST')sent.push(r.url());});
  await page.goto('/working-trace');
  await page.getByRole('button',{name:'Check each step'}).click();
  await expect(page.getByRole('heading',{name:'Start with line 2.'})).toBeVisible();
  await page.getByLabel('Your working, one step per line').fill('2(x+3)=14\n2x+6=14\n2x=8\nx=4');
  await page.getByRole('button',{name:'Check each step'}).click();
  await expect(page.getByRole('heading',{name:'Every step agrees.'})).toBeVisible();
  await page.getByLabel('Your working, one step per line').fill('x/x\n1');
  await page.getByRole('button',{name:'Check each step'}).click();
  await expect(page.getByText('Line 2: cannot verify')).toBeVisible();
  await page.getByText('Check physics dimensions',{exact:true}).click();
  await page.getByRole('button',{name:'Compare dimensions'}).click();
  await expect(page.getByText(/Dimensions agree/)).toBeVisible();
  expect(sent).toEqual([]);
});

test('micro-lesson explains a wrong answer and supports a new attempt',async({page})=>{
  await page.goto('/learn?topic=algebra');
  await page.getByRole('radio',{name:'3',exact:true}).check();
  await page.getByRole('button',{name:'Check my answer'}).click();
  await expect(page.getByRole('heading',{name:'Revisit the method.'})).toBeVisible();
  await page.getByRole('radio',{name:'5',exact:true}).check();
  await page.getByRole('button',{name:'Check my answer'}).click();
  await expect(page.getByRole('heading',{name:'That answer agrees.'})).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
});

test('hero is readable during its initial render and no Lens or fictional testimonials are marketed',async({page})=>{
  await page.goto('/');
  const heading=page.getByRole('heading',{level:1});
  await expect(heading).toBeVisible();
  expect(await heading.evaluate(el=>getComputedStyle(el,'::after').content)).toBe('none');
  await expect(page.getByRole('link',{name:/lens/i})).toHaveCount(0);
  await expect(page.getByText(/fictional preview/i)).toHaveCount(0);
});

for(const width of [390,1024,1440])for(const theme of ['light','dark'])test(`visual correction ${width} ${theme}`,async({page},info)=>{
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({colorScheme:theme as 'light'|'dark'});
  await page.goto('/');
  await expect(page.locator('.product-opening')).toBeVisible();
  const dimensions=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
  expect(dimensions.scroll).toBeLessThanOrEqual(width+1);
  if(width===390)expect(dimensions.height).toBeLessThan(10000);
  await page.screenshot({path:info.outputPath(`home-${width}-${theme}.png`),fullPage:true});
  await page.goto('/about');
  await expect(page.getByText(/Ryan Gomez is a 16 year old who likes to larp being a polymath/)).toBeVisible();
  await page.screenshot({path:info.outputPath(`about-${width}-${theme}.png`),fullPage:true});
});
