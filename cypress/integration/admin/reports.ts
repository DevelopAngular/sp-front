describe('Admin - Reports',  () => {
  before(() => {
    // @ts-ignore
    cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
  });

  after(()=> {
  
  });

  beforeEach(() => {
  
  });

  afterEach(() => {
  
  });

  const getExplorePanel = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get('app-nav #explore');
  };

  const getReports = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get('mat-dialog-container > app-pages-dialog div.title').contains('Reports');
  } 

  describe('Login into', () => {
    it('should change to school', () => {
      cy.get('app-school-toggle-bar span.school-name').contains('Cypress Testing School 2').then(() => {
        cy.get('app-school-toggle-bar div.selected-school').click();
        cy.get('div.options-wrapper div.option').should('have.length.at.least', 2);
        cy.get('div.option-data:not(.current-school)').click();
        cy.get('app-school-toggle-bar span.school-name').should('have.text', 'Cypress Testing School 1');
    });
});

    it('should run', () => {
      getExplorePanel().click().then(
        () => getReports().click()
      );
      expect(true).to.equal(true);
    });
  });
});
