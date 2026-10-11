import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { selectTheme } from './theme-controls';

const navigationCss = readFileSync(new URL('../src/styles/navigation.css', import.meta.url), 'utf8');

test.use({ viewport: { width: 1024, height: 900 } });

async function installResponsiveHeader(page: Page, authenticated: boolean) {
  // Construct only the responsive header and a painted heading. Keep the real
  // navigation stylesheet: its public/account breakpoint differs at 1024px.
  await page.setContent(`
    <style>
      .hidden { display: none; } .flex { display: flex; }
      @media (min-width: 1280px) {
        .xl\\:flex { display: flex; } .xl\\:hidden { display: none; }
      }
      body { color: rgb(20, 30, 40); }
      .dark body { color: rgb(230, 235, 240); }
      button { width: 40px; height: 40px; }
      ${navigationCss}
    </style>
    <header class="vertex-navigation" data-authenticated="${authenticated}" data-surface="${authenticated ? 'account' : 'public'}">
      <div>
        <a href="#">VertexED</a>
        <nav aria-label="Main navigation" class="hidden xl:flex">
          <button class="ml-1" data-control="desktop" aria-label="Theme: Auto. Click to switch.">Auto</button>
        </nav>
        <div class="flex xl:hidden">
          <button data-control="mobile" aria-label="Theme: Auto. Click to switch.">Auto</button>
        </div>
      </div>
    </header>
    <h1>Today</h1>
    <script>
      document.documentElement.className = 'light';
      document.body.dataset.publicClicks = '0';
      document.body.dataset.accountClicks = '0';
      const themes = ['light', 'dark', 'system'];
      let theme = 'system';
      document.querySelectorAll('button[data-control]').forEach(button => {
        button.addEventListener('click', () => {
          const header = document.querySelector('header');
          const counter = header.dataset.surface === 'account' ? 'accountClicks' : 'publicClicks';
          document.body.dataset[counter] = String(Number(document.body.dataset[counter]) + 1);
          theme = themes[(themes.indexOf(theme) + 1) % themes.length];
          const label = theme === 'system' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light';
          document.documentElement.className = theme === 'dark' ? 'dark' : 'light';
          document.querySelectorAll('button[data-control]').forEach(control => {
            control.setAttribute('aria-label', 'Theme: ' + label + '. Click to switch.');
            control.textContent = label;
          });
        });
      });
    </script>
  `);
}

test('theme selection waits for a delayed account header at the tablet breakpoint', async ({ page }) => {
  await installResponsiveHeader(page, false);
  await expect(page.locator('[data-control="desktop"]')).toBeVisible();
  await expect(page.locator('[data-control="mobile"]')).toBeHidden();
  await page.evaluate(() => {
    window.setTimeout(() => {
      const header = document.querySelector('header')!;
      header.dataset.authenticated = 'true';
      header.dataset.surface = 'account';
    }, 750);
  });

  await selectTheme(page, 'light');
  await selectTheme(page, 'dark');
  await expect(page.locator('header')).toHaveAttribute('data-surface', 'account');
  await expect(page.locator('[data-control="desktop"]')).toBeHidden();
  await expect(page.locator('[data-control="mobile"]')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-public-clicks', '0');
  await expect(page.locator('body')).toHaveAttribute('data-account-clicks', '2');
});

test('theme selection retains light and dark assertions for an already ready account', async ({ page }) => {
  await installResponsiveHeader(page, true);
  await selectTheme(page, 'light');
  await selectTheme(page, 'dark');
  await expect(page.locator('body')).toHaveAttribute('data-public-clicks', '0');
  await expect(page.locator('body')).toHaveAttribute('data-account-clicks', '2');
});
