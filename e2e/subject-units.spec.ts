import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('public/learning-library/manifest.json', 'utf8'));
const additions = manifest.entries.filter((entry: { id: string }) => entry.id.startsWith('unit-'));

for (const batch of [0,1,2,3,4]) test(`non-maths subject-unit authoring batch ${batch+1} renders every study mode and labelled practice`, async ({ page }, info) => {
  test.setTimeout(120000);
  expect(additions).toHaveLength(19);
  const entries=additions.slice(batch*4,batch*4+4);
  // Reviewer fixture only: the live publication endpoint must continue to hold
  // these unreviewed assets. This interception is never production approval.
  await page.route('**/learning-library/*.json', async route => {
    const path=new URL(route.request().url()).pathname;
    if(path==='/learning-library/manifest.json') return route.fulfill({json:{...manifest,entries}});
    if(entries.some((entry:{json:string})=>entry.json===path)) return route.fulfill({contentType:'application/json',body:await readFile(`public${path}`,'utf8')});
    return route.continue();
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const entry of entries){
    const lesson=JSON.parse(await readFile(`public${entry.json}`,'utf8'));
    await page.goto(`/resources/foundations/${entry.id}`);
    await expect(page.getByRole('heading',{level:1})).toHaveText(lesson.topic);
    await expect(page.getByText(lesson.scope,{exact:true})).toBeVisible();
    for(const section of lesson.notes) await expect(page.getByRole('heading',{name:section.heading,exact:true})).toBeVisible();
    const guided=page.getByRole('tab',{name:'Guided study',exact:true});
    await guided.focus(); await page.keyboard.press('Enter');
    await expect(guided).toHaveAttribute('aria-selected','true');
    await expect(page.getByRole('heading',{name:`3. ${lesson.teachingSequence[2].title}`,exact:true})).toBeVisible();
    await page.getByRole('button',{name:`Practise question ${lesson.questions.length}`,exact:true}).click();
    await expect(page.getByRole('heading',{name:`Question ${lesson.questions.length}`,exact:true})).toBeFocused();
    for(const question of lesson.questions) await expect(page.getByText(question.prompt,{exact:true})).toBeVisible();
    const last=page.getByRole('article').filter({has:page.getByRole('heading',{name:`Question ${lesson.questions.length}`,exact:true})});
    await expect(last.getByText(lesson.questions.at(-1).prompt,{exact:true})).toBeVisible();
    await last.getByLabel(`Your answer to question ${lesson.questions.length}`,{exact:true}).fill(lesson.questions.at(-1).answer);
    await last.getByRole('button',{name:`Check question ${lesson.questions.length}`,exact:true}).click();
    await expect(last.getByRole('status')).toHaveText('Self-review required. Compare your reasoning with the solution and marking points.');
    await last.getByText('Solution and marking points',{exact:true}).click();
    await expect(last.locator('details').getByText(lesson.questions.at(-1).answer,{exact:true})).toBeVisible();
    await page.getByRole('tab',{name:'Flashcards',exact:true}).click();
    await expect(page.getByRole('button',{name:'Reveal answer',exact:true})).toHaveCount(5);
    await page.getByRole('button',{name:'Reveal answer',exact:true}).first().click();
    await expect(page.getByText(lesson.flashcards[0].back,{exact:true})).toBeVisible();
    await page.getByRole('tab',{name:'Revise',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Revision guide',exact:true})).toBeVisible();
  }
  for(const width of [1440,1024,390]){
    await page.setViewportSize({width,height:900});
    await page.getByRole('tab',{name:'Notes',exact:true}).click();
    await page.evaluate(()=>window.scrollTo(0,0));
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
    await page.screenshot({path:info.outputPath(`unit-notes-${width}.png`),animations:'disabled'});
    await page.getByRole('tab',{name:'Practise',exact:true}).click();
    const first=page.getByRole('article').filter({has:page.getByRole('heading',{name:'Question 1',exact:true})});
    await first.scrollIntoViewIfNeeded();
    await first.screenshot({path:info.outputPath(`unit-practice-${width}.png`),animations:'disabled'});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
  }
});

test('new unit assets remain held without reviewer interception',async({request})=>{
  for(const entry of additions){
    expect((await request.get(entry.json)).status()).toBe(403);
    expect((await request.get(entry.markdown)).status()).toBe(403);
  }
  const response=await request.get('/learning-library/manifest.json');
  expect((await response.json()).entries).toEqual([]);
});

