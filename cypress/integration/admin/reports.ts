import {closeModal} from '../../support/functions/general';

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

  describe('show report / pass popup', () => {
    it('should change to school', () => {
      cy.get('app-school-toggle-bar span.school-name').contains('Cypress Testing School 2').then(() => {
        cy.get('app-school-toggle-bar div.selected-school').click();
        cy.get('div.options-wrapper div.option').should('have.length.at.least', 2);
        cy.get('div.option-data:not(.current-school)').click();
        cy.get('app-school-toggle-bar span.school-name').should('have.text', 'Cypress Testing School 1');
    });
});

    it('should change to reports sections', () => {
      cy.intercept({
        method: 'GET',
        url: 'https://smartpass.app/api/prod-us-central/v1/event_reports?limit=**'
      }).as('eventreports');
      
      getExplorePanel().click().then(
        () => {
          getReports().click();
          cy.wait('@eventreports');
          cy.get('app-sp-data-table table tbody tr:eq(0) > td:eq(0)').should('be.visible').click();
          cy.get('mat-dialog-container app-report-info-dialog').should('be.visible');         
          cy.get('div[class~="cdk-overlay-backdrop"]').click({force: true});
          cy.get('app-sp-data-table table tbody tr:eq(0) > td > div.pass-icon').then($el => {
            if (!!$el) {
              cy.wrap($el).click();
              cy.get('app-pass-card').should('be.visible');
              cy.get('div[class~="cdk-overlay-backdrop"]').click({force: true});
            }
          });

        }
      );
      expect(true).to.equal(true);
    });
  });
});
