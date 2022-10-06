/**
 * This file tests the Admin Dashboard's expected behaviour. When making changes
 * to the application, this file should also be changed. Take note of the following:
 *
 * - DOM selectors and selector chains
 * - Network requests and responses
 * - Mocks
 */

import {Http} from '../../support/utils';
import {testPasses} from '../../../src/app/models/mock_data';
import {interceptDashboardData, interceptEventReports, interceptHallPassStats} from '../../support/admin-interceptors';

/**
 * Ideally, specs should be able to change data without to refresh the page.
 * This can be done by mocking the web socket itself (check out mock-socket)
 * References:
 * - https://www.npmjs.com/package/mock-socket
 * - https://lightrun.com/answers/cypress-io-cypress-mock-websockets
 *
 * TODO: Find a reliable way to mock the web socket to change values
 */
describe('Admin Dashboard', () => {
  const leftColSelector = 'app-dashboard-content div.left';
  const rightColSelector = 'app-dashboard-content div.right';

  before(() => {
    cy.intercept(
      'https://smartpass.app/api/prod-us-central/v1/hall_passes?limit=100000&active=true',
      { method: Http.GET },
      {
        next: null,
        prev: null,
        results: testPasses
      }
    ).as('mockActivePasses');

    const statsWaitToken = interceptHallPassStats();
    const eventReportsToken = interceptEventReports();
    const dashboardStatsToken = interceptDashboardData();

    cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));

    cy.wait('@mockActivePasses');
    cy.wait(statsWaitToken);
    cy.wait(eventReportsToken);
    cy.wait(dashboardStatsToken);
  });

  it('should navigate to the Admin Dashboard', () => {
    cy.url().should('contain', '/admin/dashboard');
  });

  it('should have left and right columns', () => {
    cy.get<HTMLDivElement>(leftColSelector)
      .should('have.length', 1)
      .children().should('have.length', 3);

    cy.get<HTMLDivElement>(rightColSelector)
      .should('have.length', 1)
      .children().should('have.length', 2);
  });

  it('should show the number of active hall passes', () => {
    cy.get<HTMLDivElement>(`${leftColSelector}`)
      .children().eq(0)
      .find('div.card_header').should('have.text', 'Number of Active Hall Passes');

    cy.get<HTMLDivElement>(`${leftColSelector}`)
      .children().eq(0)
      .find('div[data-cy-active-passes]').then(element => {
        /**
         * Why not use `parseInt` here?
         *
         * `parseInt` would allow false positives to occur. For example, in the strange event that
         * the text in the div element is 10.5, parseInt converts it to 10 and isInteger returns
         * true. This would be a false positive since have 10.5 passes is impossible.
         *
         * Ideally, we want any text that's not an integer to fail
         */
        const numPasses = parseFloat(element.text());
        const isInteger = Number.isInteger(numPasses);

        expect(isInteger).eq(true, 'Check to see if the pass number is an integer');
        expect(numPasses).eq(4, 'Check if the correct number of passes were displayed from mock');
    });
  });

  it('should show the Reported Students', () => {
    cy.get<HTMLDivElement>(`${leftColSelector}`)
      .children().eq(1)
      .find('div.card_header').should('have.text', 'Reported Students');

    cy.get<HTMLDivElement>(`${leftColSelector}`)
      .children().eq(1)
      .find('div.card_title').should('have.text', 'No Reported Students Today.');
  });

  it('should show the Average Pass Time', () => {
    cy.get<HTMLDivElement>(`${leftColSelector}`)
      .children().eq(2)
      .find('div.card_header').should('have.text', 'Average Pass Time');

    cy.get<HTMLDivElement>(`${leftColSelector}`)
      .children().eq(2)
      .find('span[data-cy-average-time]').should('have.text', '10 minutes');
  });

  it('should show Most Frequent Room Destinations', () => {
    cy.get<HTMLDivElement>(`${rightColSelector}`)
      .children().eq(1)
      .find('div.card_header').should('have.text', 'Most Frequent Room  Destinations');

    cy.get<HTMLDivElement>(`${rightColSelector}`)
      .children().eq(1)
      .find('div[data-cy-frequent-destinations]').then(element => {
        const locationStrings = ['1. Main Office', '2. Science Lab', '3. Guidance', '4. Nurse', '5. Sree\'s Room'];
        locationStrings.forEach((str, index) => {
          expect(element.children().eq(index).text().trim()).eq(str);
        });
    });
  });
});
