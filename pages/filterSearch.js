export class FlightSearchPage {
  constructor(page) {
    this.page = page;
    this.fromField = page.locator('xpath=//*[@data-ui-name="input_location_from_segment_0"]');
    this.toField = page.locator('xpath=//*[@data-ui-name="input_location_to_segment_0"]');
    this.travelDateButton = page.locator('xpath=//*[@data-ui-name="button_date_segment_0"]');
    this.occupancyButton = page.locator('xpath=//*[@data-ui-name="button_occupancy"]');
    this.searchButton = page.locator('xpath=//*[@data-ui-name="button_search_submit"]');
    this.locationInput = page.locator('xpath=//*[@data-ui-name="input_text_autocomplete"]');
    this.occupancyDoneButton = page.locator('xpath=//*[@data-ui-name="button_occupancy_action_bar_done"]');
  }
}
