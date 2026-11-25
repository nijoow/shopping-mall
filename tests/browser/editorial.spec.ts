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
    page.locator('main').getByRole('link', { name: '디자인 만들기', exact: true }),
  ).toHaveAttribute('href', '/studio/runner');
  await page.setViewportSize({ width: 390, height: 844 });
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
