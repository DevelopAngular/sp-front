import {closeModal} from '../../support/functions/general';

describe('Teacher - Reports',  () => {
  const timeout = 20000;
  const ENDPOINT = 'https://smartpass.app/api/prod-us-central/v1/';

  before(() => {
      // @ts-ignore
    cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
  });

  after(()=> {
    cy.logoutTeacher();
  });

  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      // @ts-ignore
      Cypress.runner.stop();
    }
  });

  // it goes to demoschool 1
  describe('Seaching + reporting', () => {
    it('should expects a teacher to search for a student and report him to admin', () => {
      cy.intercept({
        method: 'GET',
        url: ENDPOINT + 'hall_passes?**'
      }).as('hallpasses');
      cy.visit('http://localhost:4200/main/hallmonitor');
      cy.wait('@hallpasses', {timeout});

      cy.intercept({
        method: 'GET',
        url: ENDPOINT + 'users?role=_profile_student**'
      }).as('searchstudents');

      // trigger report form popup
      cy.get('div.buttons app-square-button').click();
      // search students to be reported
      cy.get('app-report-form app-round-input input[placeholder]:eq(0)').type('demo');
      cy.wait('@searchstudents', {timeout});

      cy.get('app-report-form div[class~=divider] app-white-button').should('not.exist');

      // assumed we have students found!
      // choose a studewnt
      cy.get('app-report-form div[class~="option-list_item"]').first().click();
      // set up a specific message
      cy.get('app-report-form textarea').type('TEST_REPORT_STUDENT');

      cy.intercept({
        method: 'POST',
        url: ENDPOINT + 'event_reports/bulk_create'
      }).as('reportstudents');

      // submit report
      cy.get('app-report-form div[class~=divider] app-white-button').click();
      cy.wait('@reportstudents', {timeout}).its('response').then(res => {
        expect(res.headers).to.include({'content-type': 'application/json'});
        expect(res.statusCode).to.equal(200);
      });

    });
    
    it('should a teacher reports a pass', () => {

      cy.intercept({
        method: 'GET',
        url: ENDPOINT + 'locations?limit=**'
      }).as('locations');

      // press home tab
      cy.get('app-navbar app-nav-button').contains('Home').click();
      cy.wait('@locations', {timeout});

      // press the first pass tile that exists
      // TODO ensures that a tile exists otherwise create it
      cy.get('app-pass-collection app-pass-tile').first().click();
      // report button on pass popup
      cy.get('app-pass-card app-student-passes app-gradient-button').contains('Report').should('be.visible').click();

      cy.get('mat-dialog-container app-report-form div[class~=divider] app-white-button').should('be.visible');

      // set up a specific message
      cy.get('app-report-form textarea').type('TEST_REPORT_STUDENT');

      cy.intercept({
        method: 'POST',
        url: ENDPOINT + 'event_reports/bulk_create'
      }).as('reportstudents');

      // submit report
      cy.get('mat-dialog-container app-report-form div[class~=divider] app-white-button').click();
      cy.wait('@reportstudents', {timeout}).its('response').then(res => {
        expect(res.headers).to.include({'content-type': 'application/json'});
        expect(res.statusCode).to.equal(200);
        closeModal();
      });

    });

    it('should a teacher reports from the student info card', () => {
      cy.intercept({
        method: 'GET',
        url: ENDPOINT + 'users?role=_profile_student&limit=**'
      }).as('searchstudents');

      cy.intercept({
        method: 'POST',
        url: ENDPOINT + 'recent_search'
      }).as('recentsearch');
      
      cy.get('app-smartpass-search app-round-input').should('be.visible').type('demo');
      cy.wait('@searchstudents');
      cy.get('app-smartpass-search div[class~="search-result"] div[class~=value]:eq(0)').should('be.visible').click();
      cy.wait('@recentsearch');
      cy.get('app-student-info-card app-square-button').should('be.visible').click();

      cy.get('app-report-form textarea').type('TEST_REPORT_FOUND_STUDENT');

      cy.intercept({
        method: 'POST',
        url: ENDPOINT + 'event_reports/bulk_create'
      }).as('reportstudents');

      // submit report
      cy.get('app-report-form div[class~=divider] app-white-button').click();
      cy.wait('@reportstudents', {timeout}).its('response').then(res => {
        expect(res.headers).to.include({'content-type': 'application/json'});
        expect(res.statusCode).to.equal(200);
      });
    });

  });

});


