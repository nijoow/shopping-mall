import { readFile } from 'node:fs/promises';
import type { Route } from '@playwright/test';
import {
  test,
  expect,
  state,
  modelLoaded,
  noHorizontalOverflow,
  visibleControlWithinViewport,
} from './fixtures';

const studioName = 'BROWSER LOW 3';

// Exactly three complete flows, rather than repeating each flow for every viewport.
test('normal clothing order: keyboard size selection, mobile checkout and immutable order', async ({
  page,
}) => {
  await page.goto('/product/field-jacket');
  await expect(
    page.getByRole('heading', { name: 'FIELD JACKET', exact: true }),
  ).toBeVisible();
  await noHorizontalOverflow(page); // 1440 desktop
  const buy = page.getByRole('button', { name: '바로 주문하기', exact: true });
  await buy.click(); // Required-option failure must move focus to the first size.
  const sizes = page.getByRole('group', { name: '사이즈 선택', exact: true });
  await expect(sizes.getByRole('button').first()).toBeFocused();
  const medium = sizes.getByRole('button', { name: 'M', exact: true });
  await medium.focus();
  await page.keyboard.press('Enter');
  await expect(medium).toHaveAttribute('aria-pressed', 'true');
  await buy.click();
  await expect(page).toHaveURL(/\/checkout\?items=/);
  await expect(page.getByTestId('checkout-submit')).toBeEnabled();
  await page.setViewportSize({ width: 390, height: 844 });
  await noHorizontalOverflow(page);
  await visibleControlWithinViewport(page, page.getByTestId('checkout-submit'));
  const before = await state(page);
  expect(before.cart).toHaveLength(1);
  expect(before.cart[0]).toMatchObject({
    productId: 'field-jacket',
    size: 'M',
    quantity: 1,
    config: null,
  });
  await page.getByTestId('checkout-submit').click();
  await expect(page).toHaveURL(/\/orders\/[a-z0-9-]+$/);
  await expect(
    page.getByText(
      '주문 확정 · 모의 결제 주문이며 실제 배송은 진행되지 않습니다.',
      { exact: true },
    ),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  const after = await state(page);
  expect(after.cart).toHaveLength(0);
  expect(after.orders).toHaveLength(1);
  expect(after.orders[0].items[0]).toMatchObject({
    productId: 'field-jacket',
    size: 'M',
    quantity: 1,
    config: null,
  });
  await page.reload();
  expect((await state(page)).orders[0].id).toBe(after.orders[0].id);
});

test('low v3: real 3D edit, PNG export, save/reopen/share, dialog keyboard and configured order', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 960 });
  const modelResponse = page.waitForResponse(
    response =>
      /\/models\/low-v3\.glb$/.test(new URL(response.url()).pathname) &&
      response.status() === 200,
  );
  await page.goto('/studio/low');
  await modelResponse;
  await expect(page.getByTestId('studio')).toBeVisible();
  await modelLoaded(page, 'low', 3);
  await page.getByTestId('design-name').fill(studioName);
  await page.getByRole('button', { name: '코발트 색상', exact: true }).click();
  await page.getByRole('button', { name: /^스웨이드/ }).click();
  await page.getByLabel('YOUR SIGNATURE', { exact: true }).fill('LOW3');
  await expect
    .poll(
      async () =>
        (await state(page)).designs.find(d => d.name === studioName)?.config
          .engraving,
    )
    .toBe('LOW3');
  const saved = (await state(page)).designs.find(d => d.name === studioName)!;
  expect(saved.config).toMatchObject({
    model: 'low',
    modelVersion: 3,
    engraving: 'LOW3',
    material: 'suede',
    colors: { upper: '#315684' },
  });
  expect(saved.preview).toMatch(/^data:image\/(webp|png);base64,/);
  const downloadEvent = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'PNG 이미지 저장', exact: true })
    .click();
  const download = await downloadEvent;
  const pngPath = test.info().outputPath('low-v3.png');
  await download.saveAs(pngPath);
  const png = await readFile(pngPath);
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.length).toBeGreaterThan(1000);
  expect(png.readUInt32BE(16)).toBeGreaterThan(100);
  expect(png.readUInt32BE(20)).toBeGreaterThan(100);
  await noHorizontalOverflow(page);
  await page.getByRole('link', { name: '내 디자인', exact: true }).click();
  await expect(page).toHaveURL('/designs');
  const card = page.locator('article').filter({
    has: page.getByRole('heading', { name: studioName, exact: true }),
  });
  await expect(card).toBeVisible();
  const remove = card.getByRole('button', { name: '삭제', exact: true });
  await remove.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('alertdialog', {
    name: '디자인 삭제',
    exact: true,
  });
  await expect(
    dialog.getByRole('button', { name: '취소', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    dialog.getByRole('button', { name: '삭제', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    dialog.getByRole('button', { name: '취소', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(remove).toBeFocused();
  expect((await state(page)).designs.some(d => d.id === saved.id)).toBe(true);
  await card.getByRole('link').click();
  await expect(page).toHaveURL(new RegExp(`/studio/low\\?design=${saved.id}`));
  await modelLoaded(page, 'low', 3);
  await expect(page.getByTestId('design-name')).toHaveValue(studioName);
  await expect(page.getByLabel('YOUR SIGNATURE', { exact: true })).toHaveValue(
    'LOW3',
  );
  await expect(
    page.getByRole('button', { name: '코발트 색상', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '공유', exact: true }).click();
  const shareLink = page.getByRole('textbox', { name: /공유 링크/ });
  await expect(shareLink).toHaveValue(/\/share\/[A-Za-z0-9_-]+$/);
  const sharedPage = await context.newPage();
  await sharedPage.goto(await shareLink.inputValue());
  await expect(
    sharedPage.getByRole('heading', { name: studioName, exact: true }),
  ).toBeVisible();
  await modelLoaded(sharedPage, 'low', 3);
  await expect(sharedPage.getByText('LOW3', { exact: true })).toBeVisible();
  await sharedPage.close();
  await page
    .getByRole('button', { name: '02 사이즈 · 주문', exact: true })
    .click();
  await page
    .getByRole('group', { name: 'SIZE — MM' })
    .getByRole('button', { name: '270', exact: true })
    .click();
  await page
    .getByRole('button', { name: '이 디자인 주문하기', exact: true })
    .click();
  await expect(page).toHaveURL(/\/checkout\?items=/);
  await page.getByTestId('checkout-submit').click();
  await expect(page).toHaveURL(/\/orders\/[a-z0-9-]+$/);
  const ordered = (await state(page)).orders[0];
  expect(ordered.items[0].config).toEqual(saved.config);
  expect(ordered.items[0].preview).toMatch(/^data:image\/(webp|png);base64,/);
  await page.getByRole('button', { name: '주문한 3D 다시 보기' }).click();
  const preview = page.getByRole('dialog', {
    name: '주문 당시의 디자인',
    exact: true,
  });
  await expect(preview).toBeVisible();
  await modelLoaded(page, 'low', 3);
  await page.keyboard.press('Escape');
  await expect(preview).toBeHidden();
});

test('failed save keeps edits: network retry, real revision conflict and independent copy', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 960 });
  await page.goto('/studio/low');
  await modelLoaded(page, 'low', 3);
  await expect.poll(async () => (await state(page)).designs.length).toBe(1);
  let failSave = true;
  const intercept = async (route: Route) => {
    const request = route.request();
    const body = request.method() === 'POST' ? request.postDataJSON() : null;
    if (body?.op === 'design.save' && failSave) await route.abort('failed');
    else await route.continue();
  };
  await page.route('**/api/demo', intercept);
  const name = page.getByTestId('design-name');
  await name.fill('NETWORK RECOVERY');
  const failure = page.locator(
    '[role="alert"][data-error-code="NETWORK_ERROR"]',
  );
  await expect(failure).toBeVisible();
  await expect(name).toHaveValue('NETWORK RECOVERY');
  expect((await state(page)).designs[0].name).not.toBe('NETWORK RECOVERY');
  failSave = false;
  await page.getByTestId('studio-retry').click();
  await expect(failure).toBeHidden();
  await expect
    .poll(async () => (await state(page)).designs[0].name)
    .toBe('NETWORK RECOVERY');
  await page.unroute('**/api/demo', intercept);
  let rateLimited = true;
  const limitOnce = async (route: Route) => {
    const request = route.request();
    const body = request.method() === 'POST' ? request.postDataJSON() : null;
    if (body?.op === 'design.save' && rateLimited) {
      rateLimited = false;
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: { 'Retry-After': '1' },
        body: JSON.stringify({
          error: '잠시 후 다시 시도해 주세요.',
          code: 'RATE_LIMITED',
          retryAfter: 1,
        }),
      });
    } else await route.continue();
  };
  await page.route('**/api/demo', limitOnce);
  await name.fill('RATE RECOVERY');
  await expect(
    page.locator('[role="alert"][data-error-code="RATE_LIMITED"]'),
  ).toBeVisible();
  await expect(page.getByTestId('studio-retry')).toBeDisabled();
  await expect(page.getByTestId('studio-retry')).toBeEnabled();
  await page.getByTestId('studio-retry').click();
  await expect
    .poll(async () => (await state(page)).designs[0].name)
    .toBe('RATE RECOVERY');
  await page.unroute('**/api/demo', limitOnce);
  const original = (await state(page)).designs[0];
  const concurrent = await page.evaluate(async original => {
    const response = await fetch('/api/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        op: 'design.save',
        data: {
          id: original.id,
          version: original.version,
          name: 'OTHER WINDOW',
          config: original.config,
          preview: original.preview,
        },
      }),
    });
    return response.status;
  }, original);
  expect(concurrent).toBe(200);
  await name.fill('PRESERVED LOCAL COPY');
  await page.getByLabel('YOUR SIGNATURE', { exact: true }).fill('LOCAL');
  const conflict = page.locator('[role="alert"][data-error-code="CONFLICT"]');
  await expect(conflict).toBeVisible();
  await expect(name).toHaveValue('PRESERVED LOCAL COPY');
  await expect(page.getByLabel('YOUR SIGNATURE', { exact: true })).toHaveValue(
    'LOCAL',
  );
  await expect(page.getByTestId('studio-save-copy')).toBeEnabled();
  await page.getByTestId('studio-save-copy').click();
  await expect(conflict).toBeHidden();
  await expect.poll(async () => (await state(page)).designs.length).toBe(2);
  const recovered = await state(page);
  expect(recovered.designs.find(d => d.id === original.id)).toMatchObject({
    name: 'OTHER WINDOW',
    config: original.config,
  });
  const copy = recovered.designs.find(d => d.name === 'PRESERVED LOCAL COPY')!;
  expect(copy.id).not.toBe(original.id);
  expect(copy.config).toMatchObject({
    model: 'low',
    modelVersion: 3,
    engraving: 'LOCAL',
  });
  await noHorizontalOverflow(page);
  await page.getByRole('link', { name: '내 디자인', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'PRESERVED LOCAL COPY', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'PRESERVED LOCAL COPY', exact: true }),
  ).toBeVisible();
});
