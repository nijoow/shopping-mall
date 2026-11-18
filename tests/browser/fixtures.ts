import {
  test as base,
  expect,
  type Page,
  type Locator,
} from '@playwright/test';
import type { DemoState } from '../../src/domain/types';

export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: async ({}, provide) => {
    const errors: string[] = [];
    await provide(errors);
    expect(errors, 'No unexpected browser errors').toEqual([]);
  },
  baseURL: async ({}, provide) => {
    const url = process.env.NIJOOW_BROWSER_BASE_URL;
    if (!url || new URL(url).hostname !== '127.0.0.1')
      throw new Error('The isolated browser server is required.');
    await provide(url);
  },
  page: async ({ page, baseURL, pageErrors }, provide) => {
    const failures: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.context().route('**/*', async route => {
      const url = new URL(route.request().url());
      if (
        ['http:', 'https:'].includes(url.protocol) &&
        url.origin !== baseURL
      ) {
        failures.push(`${url.origin}${url.pathname}`);
        await route.abort('blockedbyclient');
        return;
      }
      await route.continue();
    });
    await provide(page);
    expect(
      failures,
      'Browser requests must stay on the temporary local server',
    ).toEqual([]);
  },
});
export { expect };

// Browser fetch honors loopback Secure-cookie handling exactly like the app.
// APIRequestContext treats HTTP Secure cookies differently and would mint a new guest.
export async function state(page: Page): Promise<DemoState> {
  const response = await page.evaluate(async () => {
    const r = await fetch('/api/demo', { cache: 'no-store' });
    return { status: r.status, body: await r.json() };
  });
  expect(response.status).toBe(200);
  return response.body.state;
}

export async function noHorizontalOverflow(page: Page) {
  const excess = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(
    excess,
    'Page must fit the viewport without horizontal scrolling',
  ).toBeLessThanOrEqual(1);
}

export async function visibleControlWithinViewport(
  page: Page,
  control: Locator,
) {
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
}

export async function modelLoaded(
  page: Page,
  model: 'low' | 'runner',
  version: number,
) {
  const viewer = page.getByTestId('product-viewer').first();
  await expect(viewer).toHaveAttribute('data-loaded', 'true', {
    timeout: 30000,
  });
  await expect(viewer).toHaveAttribute('data-model', model);
  await expect(viewer).toHaveAttribute('data-model-version', String(version));
  await expect(viewer.locator('canvas')).toBeVisible();
}
