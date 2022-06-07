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
    return cy.get('app-nav app-nav-button').contains('Explore');
  };

  const getReports = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get('mat-dialog-container > app-pages-dialog div.title').contains('Reports');
  } 

  describe('Login into', () => {
    it('should run', () => {
      getExplorePanel().click().then(
        () => getReports().click()
      );
      expect(true).to.equal(true);
    });
  });
});
