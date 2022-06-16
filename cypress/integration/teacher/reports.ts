import {closeModal, searchForStudent, waitForElement} from '../../support/functions/general';

describe('Teacher - Reports', () => {
  function rnd(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const timeout = 20000;
  const ENDPOINT = 'https://smartpass.app/api/prod-us-central/v1/';

  // random string to individualise tests
  const SUFFIX = '_' + rnd(3);

  before(() => {
    // @ts-ignore
    cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
  });

  after(() => {
    //cy.logoutTeacher();
  });

  afterEach(function () {
    if (this.currentTest.state === 'failed') {
      // @ts-ignore
      Cypress.runner.stop();
    }
  });

  // it goes to demoschool 1
  describe('Searching + reporting', () => {
    it('should expects a teacher to search for a student and report him to admin', () => {
      cy.intercept({
        method: 'GET',
        url: ENDPOINT + 'hall_passes?**'
      }).as('hallpasses');

      cy.visit('http://localhost:4200/main/hallmonitor');
      cy.wait('@hallpasses', {timeout});

      // trigger report form popup
      cy.get('app-square-button.report-student-button').click();
      waitForElement('mat-dialog-container app-report-form');
      // search students to be reported
      waitForElement('div.student-select app-sp-search app-round-input input');
      searchForStudent('div.student-select app-sp-search', 'demo');
      waitForElement('div.option-list_scrollable');
      cy.get('app-report-form div[class~=divider] app-white-button').should('not.exist');

      // assumed we have students found!
      // choose a student
      cy.get('app-report-form div.option-list_item').first().click();

      // set up a specific message
      cy.get('app-report-form div.message-wrapper textarea').type('TEST_REPORT_STUDENT' + SUFFIX);

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
      cy.get('app-report-form textarea').type('TEST_REPORT_PASS' + SUFFIX);

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

      cy.get('app-report-form textarea').type('TEST_REPORT_FOUND_STUDENT' + SUFFIX);

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

    it('should find reports on admin view', () => {
      cy.logoutTeacher();
      cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));

      cy.get('app-school-toggle-bar span.school-name').contains('Cypress Testing School 2').then(() => {
        cy.get('app-school-toggle-bar div.selected-school').click();
        cy.get('div.option-data:not(.current-school)').click();
      }).then(() => {
        cy.intercept({
          method: 'GET',
          url: 'https://smartpass.app/api/prod-us-central/v1/event_reports?limit=**'
        }).as('eventreports');

        cy.get('app-nav #explore').click().then(
          () => {
            cy.get('mat-dialog-container > app-pages-dialog div.title').contains('Reports').click();
            cy.wait('@eventreports');
            cy.get('app-sp-data-table table tbody tr').then($rows => {
              //cy.wrap($rows[0]).waitUntil(jel => jel.get(0).isConnected);
              const allowed = ['TEST_REPORT_STUDENT', 'TEST_REPORT_PASS', 'TEST_REPORT_FOUND_STUDENT'].map(el => el + SUFFIX);
              const messages = Array.from($rows.find('td div.message')).slice(0, 3).map($el => $el.textContent.trim());
              const found = (allowed.sort().join() == messages.sort().join());
              cy.log(found);
              expect(found).to.equal(true);
              cy.get('app-nav app-icon-button div.icon-button-container').click({force: true});
              cy.get('app-root mat-dialog-container > app-settings div.sign-out').click({force: true});
            });
          });
      });

    });

  });

});


