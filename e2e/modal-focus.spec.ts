import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const modalFocusSource = await readFile(
  new URL('../src/lib/modalFocus.mjs', import.meta.url),
  'utf8',
);

test('planner modal focus stays contained and returns to its opener', async ({ page }) => {
  await page.setContent(`
    <!doctype html>
    <html lang="en">
      <body>
        <button id="open-dialog" type="button">Open planner dialog</button>
        <div id="overlay" hidden>
          <div
            id="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            tabindex="-1"
          >
            <h2 id="dialog-title">Edit planner task</h2>
            <p id="dialog-description">Update the task and save your changes.</p>
            <label for="task-name">Task name</label>
            <input id="task-name" />
            <button id="save-task" type="button">Save task</button>
            <button id="close-dialog" type="button" aria-label="Close edit task dialog">×</button>
          </div>
        </div>
      </body>
    </html>
  `);

  await page.addScriptTag({
    type: 'module',
    content: `${modalFocusSource}
      const opener = document.getElementById('open-dialog');
      const overlay = document.getElementById('overlay');
      const dialog = document.getElementById('dialog');
      const taskName = document.getElementById('task-name');
      const closeButton = document.getElementById('close-dialog');
      let returnFocusTarget = null;

      function closeDialog() {
        overlay.hidden = true;
        window.queueMicrotask(() => restoreModalFocus(returnFocusTarget));
      }

      opener.addEventListener('click', () => {
        returnFocusTarget = document.activeElement;
        overlay.hidden = false;
        window.requestAnimationFrame(() => focusInitialModalElement(dialog, taskName));
      });

      closeButton.addEventListener('click', closeDialog);
      dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeDialog();
          return;
        }
        trapModalFocus(event, dialog);
      });

      window.__modalHarnessReady = true;
    `,
  });

  await expect.poll(
    () => page.evaluate(() => (window as Window & { __modalHarnessReady?: boolean }).__modalHarnessReady),
  ).toBe(true);

  const opener = page.getByRole('button', { name: 'Open planner dialog' });
  const taskName = page.getByLabel('Task name');
  const closeButton = page.getByRole('button', { name: 'Close edit task dialog' });
  const overlay = page.locator('#overlay');

  await opener.focus();
  await opener.click();
  await expect(overlay).toBeVisible();
  await expect(taskName).toBeFocused();

  await closeButton.focus();
  await page.keyboard.press('Tab');
  await expect(taskName).toBeFocused();

  await taskName.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(overlay).toBeHidden();
  await expect(opener).toBeFocused();
});
