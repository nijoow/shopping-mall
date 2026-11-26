import { test, expect, noHorizontalOverflow } from './fixtures';

test('editorial home keeps shopping, studio and mobile navigation accessible', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /SNEAKER\s*EDIT\./,
  );
  await noHorizontalOverflow(page);
  await page.getByRole('link', { name: '상품 보기', exact: true }).click();
  await expect(page).toHaveURL('/shop/sneakers');
  await page.goBack();
  await expect(
    page
      .locator('main')
      .getByRole('link', { name: '러너 편집하기', exact: true }),
  ).toHaveAttribute('href', '/studio/runner?new=1');
  for (const width of [320, 430, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => document.fonts.ready);
    const rects = await page.locator('.hero-title').evaluate(title => {
      const range = document.createRange();
      range.selectNodeContents(title);
      return Array.from(range.getClientRects(), r => ({
        left: r.left,
        right: r.right,
        top: r.top,
      }));
    });
    expect(Math.min(...rects.map(r => r.left))).toBeGreaterThanOrEqual(0);
    expect(Math.max(...rects.map(r => r.right))).toBeLessThanOrEqual(width);
    expect(rects.at(-1)!.top).toBeGreaterThan(rects[0].top);
  }
  await noHorizontalOverflow(page);
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: '메뉴', exact: true }).click();
    await expect(
      page.getByRole('navigation', { name: '모바일 주 메뉴' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('navigation', { name: '모바일 주 메뉴' }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: '메뉴', exact: true }),
    ).toBeFocused();
  }
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await page.getByLabel('검색어').fill('러너');
  await page.getByRole('button', { name: '검색 실행', exact: true }).click();
  await expect(page).toHaveURL(/\/shop\/all\?q=/);
});
