import {Http} from './utils';
import hallPassStats from '../fixtures/hall-pass-stats.json';
import dashboardStats from '../fixtures/dashboard-stats.json';
import eventReports from '../fixtures/event-reports.json';

/**
 * The functions in this file create a Cypress Interceptor and loads it with a pre-defined response.
 * Each function return a string token that can be used along with `cy.wait` in the main body where
 * this function is called. This allows you to create the interceptor, execute other instructions and
 * then wait on the request.
 */

/**
 * Intercepts `/api/prod-us-central/v1/hall_passes/stats`.
 * @param customWaitToken defaults to `mockStats`
 * @param customResponse custom response array
 * @return wait token
 */
export const interceptHallPassStats = (customWaitToken = 'mockStats', customResponse?: any): string => {
  /**
   * This request usually returns other objects with names 'Active Pass Count'
   * and 'Average passes per student', but the UI doesn't display this information
   * on the dashboard, so the mock doesn't need to have this data.
   */

  const response = customResponse ?? hallPassStats;
  cy.intercept(
    'https://smartpass.app/api/prod-us-central/v1/hall_passes/stats',
    { method: Http.GET },
    response
  ).as(customWaitToken);

  return `@${customWaitToken}`;
};

/**
 * Intercepts `/api/prod-us-central/v1/admin/dashboard`.
 * @param customWaitToken defaults to `mockDashboard`
 * @param customResponse custom response JSON
 * @return wait token
 */
export const interceptDashboardData = (customWaitToken = 'mockDashboard', customResponse?: any): string => {
  const response = customResponse ?? dashboardStats;
  cy.intercept(
    'https://smartpass.app/api/prod-us-central/v1/admin/dashboard',
    { method: Http.GET },
    dashboardStats
  ).as(customWaitToken);

  return `@${customWaitToken}`;
};

/**
 * Intercepts `/api/prod-us-central/v1/event_reports**`.
 * @param customWaitToken defaults to `mockEventReports`
 * @param customResponse custom response JSON
 * @return wait token
 */
export const interceptEventReports = (customWaitToken = 'mockEventReports', customResponse?: any): string => {
  const response = customResponse ?? eventReports;
  cy.intercept(
    'https://smartpass.app/api/prod-us-central/v1/event_reports**',
    { method: Http.GET },
    eventReports
  ).as(customWaitToken);

  return `@${customWaitToken}`;
};

