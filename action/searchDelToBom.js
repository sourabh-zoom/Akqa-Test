import { expect } from '@playwright/test';
import { FlightSearchPage } from '../pages/filterSearch.js';

export class FlightSearchActions {
  constructor(page) {
    this.page = page;
    this.flightSearchPage = new FlightSearchPage(page);
  }

  async open() {
    await this.page.goto('https://www.booking.com/flights/index.en-gb.html', {
      waitUntil: 'domcontentloaded'
    });
    await expect(this.flightSearchPage.fromField).toBeVisible();
  }

  async openPicker(field) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (await field.getAttribute('aria-expanded') === 'true') {
        return;
      }
      await field.click();
    }
    await expect(field).toHaveAttribute('aria-expanded', 'true');
  }

  async selectLocation(field, searchTerm, selectedValue, optionName) {
    const currentValue = (await field.innerText()).replace(/\s+/g, ' ');
    if (selectedValue.test(currentValue)) {
      return;
    }

    await this.openPicker(field);
    await this.flightSearchPage.locationInput.waitFor({ state: 'visible' });

    const autocompleteResponse = this.page.waitForResponse(
      response => response.url().includes('/api/autocomplete/'),
      { timeout: 30000 }
    );
    await this.flightSearchPage.locationInput.fill(searchTerm);

    const response = await autocompleteResponse;
    if (!response.ok()) {
      throw new Error(`Location search failed with HTTP ${response.status()}.`);
    }

    const option = this.page.getByText(optionName).last();
    await option.waitFor({ state: 'visible', timeout: 30000 });
    await option.click();
    await expect(field).toContainText(selectedValue);
  }

  async selectOriginDelhi() {
    await this.selectLocation(
      this.flightSearchPage.fromField,
      'Delhi',
      /DEL\s+Delhi/i,
      /DEL\s+Delhi/i
    );
  }

  async selectDestinationMumbai() {
    await this.selectLocation(
      this.flightSearchPage.toField,
      'Mumbai',
      /BOM\s+Mumbai/i,
      /BOM\s+Mumbai All airports/i
    );
  }

  async selectDestinationDelhi() {
    await this.selectLocation(
      this.flightSearchPage.toField,
      'Delhi',
      /DEL\s+Delhi/i,
      /DEL\s+Delhi International Airport/i
    );
  }

  async selectDateOffset(offsetDays) {
    const { travelDateButton } = this.flightSearchPage;
    await this.openPicker(travelDateButton);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + offsetDays);
    const dateValue = [
      targetDate.getFullYear(),
      String(targetDate.getMonth() + 1).padStart(2, '0'),
      String(targetDate.getDate()).padStart(2, '0')
    ].join('-');
    const targetCell = this.page.locator(`xpath=//*[@data-date="${dateValue}"]`);

    for (let attempt = 0; attempt < 24; attempt += 1) {
      if (await targetCell.count() && await targetCell.isVisible()) {
        break;
      }

      const visibleDates = this.page.locator('xpath=//*[@role="gridcell"]//*[@data-date]');
      const firstDate = await visibleDates.first().getAttribute('data-date');
      const lastDate = await visibleDates.last().getAttribute('data-date');
      if (!firstDate || !lastDate) {
        throw new Error('Calendar dates were not found.');
      }

      if (dateValue >= firstDate && dateValue <= lastDate) {
        throw new Error(`Date ${dateValue} is unavailable in the calendar.`);
      }

      const monthButton = this.page.getByRole('button', {
        name: dateValue < firstDate ? 'Previous month' : 'Next month'
      });
      await monthButton.click();
    }

    await expect(targetCell).toBeVisible();
    await targetCell.click();
    await targetCell.click();
    return dateValue;
  }

  async setOneAdult() {
    const { occupancyButton, occupancyDoneButton } = this.flightSearchPage;
    await this.openPicker(occupancyButton);
    await expect(occupancyButton).toContainText(/1\s+adult/i);
    await occupancyDoneButton.click();
  }

  async search() {
    await this.flightSearchPage.searchButton.click();
  }

  async searchDelhiToMumbai(dateOffset) {
    await this.open();
    await this.selectOriginDelhi();
    await this.selectDestinationMumbai();
    const selectedDate = await this.selectDateOffset(dateOffset);
    await this.setOneAdult();
    await this.search();
    return selectedDate;
  }
}
