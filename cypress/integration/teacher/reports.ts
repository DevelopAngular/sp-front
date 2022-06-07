describe('Teacher - Reports',  () => {
  const timeout = 20000;

  before(() => {
    cy.intercept({
      method: 'GET',
      url: 'https://smartpass.app/api/prod-us-central/v1/hall_passes?**'
    }).as('hallpasses');
      // @ts-ignore
    cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
    cy.visit('http://localhost:4200/main/hallmonitor');
    cy.wait('@hallpasses', {timeout});
  });

  after(()=> {
  
  });

  beforeEach(() => {
  
  });

  afterEach(() => {
  
  });

  const getExplorePanel = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get('app-nav app-nav-button').contains('Explore');
  };

  const getReports = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get('mat-dialog-container > app-pages-dialog div.title').contains('Reports');
  } 

  describe('Report', () => {
    it('should run', () => {
      cy.intercept({
        method: 'GET',
        url: 'https://smartpass.app/api/prod-us-central/v1/users?role=_profile_student**'
      }).as('searchstudents');

      // trigger report form popup
      cy.get('div.buttons app-square-button').click();
      // search students to be reported
      cy.get('app-report-form app-round-input input[placeholder="Search students"]').type('demo');
      cy.wait('@searchstudents', {timeout});

      // assumed we have students found!
      // choose a studewnt
      cy.get('app-report-form div[class~="option-list_item"]').first().click();
      // set up a specific message
      cy.get('app-report-form textarea').type('TEST_REPORT');

      cy.intercept({
        method: 'POST',
        url: 'https://smartpass.app/api/prod-us-central/v1/event_reports/bulk_create'
      }).as('reportstudents');

      // submit report
      cy.get('app-report-form div[class~=divider] app-white-button').click();
      cy.wait('@reportstudents', {timeout});

      expect(true).to.equal(true);
    });
  });

});


