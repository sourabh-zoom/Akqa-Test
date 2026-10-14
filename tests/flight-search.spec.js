import { test, expect } from '@playwright/test';
import { FlightSearchActions } from '../action/searchDelToBom.js';

test.describe.serial('Flight route search', () => {
 // test.describe.configure({ mode: 'serial' });

  let page;
  let actions;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    actions = new FlightSearchActions(page);
    await actions.open();
  });

  test.afterAll(async () => {
    await page.close();
  });

  async function verifySearchResults(expectedDate) {
    await expect(page).toHaveURL(url => {
      return /\/flights\/DEL-BOM\//i.test(url.pathname)
        && url.searchParams.get('depart') === expectedDate
        && url.searchParams.get('return') === expectedDate;
    }, { timeout: 30000 });

    await expect(
      page.getByText(
        /^We found (?:[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+) flight options$/i
      )
    ).toBeVisible({ timeout: 60000 });
  }

  test('Search DEL to BOM for today and verify the selected travel date', async () => {
    const selectedDate = await actions.searchDelhiToMumbai(0);
    await verifySearchResults(selectedDate);
  });

  test('Search DEL to BOM for tomorrow and verify the selected travel date', async () => {
    const selectedDate = await actions.searchDelhiToMumbai(1);
    await verifySearchResults(selectedDate);
  });

  test('Show warning when origin and destination are both Delhi', async () => {
    await actions.open();
    await actions.selectOriginDelhi();
    await actions.selectDestinationDelhi();
    await actions.search();

    await expect(
      page.getByText("Origin and destination can't be the same", { exact: true })
    ).toBeVisible({ timeout: 15000 });
  });
});
