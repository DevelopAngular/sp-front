import {closeModal} from '../../support/functions/general';

//TODO move it to a more generat level
const logoutAdmin = () => {
  // the concret div.icon-button-container seems to properly trigger click event
  cy.get('app-nav app-icon-button div.icon-button-container').click({force: true});
  cy.get('app-root mat-dialog-container > app-settings div.sign-out').click({force: true});
};

describe('Admin - Reports',  () => {
  before(() => {
    // @ts-ignore
    cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
  });

  after(()=> {
    logoutAdmin(); 
  });

  const getExplorePanel = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get('app-nav #explore');
  };

  const getReports = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get('mat-dialog-container > app-pages-dialog div.title').contains('Reports');
  } 

    it('should change to school', () => {
      cy.get('app-school-toggle-bar span.school-name').contains('Cypress Testing School 2').then(() => {
        cy.get('app-school-toggle-bar div.selected-school').click();
        cy.get('div.options-wrapper div.option').should('have.length.at.least', 2);
        cy.get('div.option-data:not(.current-school)').click();
        cy.get('app-school-toggle-bar span.school-name').should('have.text', 'Cypress Testing School 1');
      });
    });

    it('should opens specific popups, change the report status', () => {

      cy.intercept({
        method: 'GET',
        url: 'https://smartpass.app/api/prod-us-central/v1/event_reports?limit=**'
      }).as('eventreports');
      
      getExplorePanel().click().then(
        () => {
          getReports().click();
          cy.wait('@eventreports');
          // try to find an a row with a pass tile
          cy.get('app-sp-data-table table tbody tr').then($rows => {
            const maybePassTiles = $rows.find('td div.pass-icon:eq(0)');
            const hasPassTile = maybePassTiles.length > 0;
            // choose a row
            let $row;
            if (hasPassTile) {
              $row = maybePassTiles[0].closest('tr');
            } else {
              $row = $rows[0];
            };
            
            const wrap = cy.wrap($row);
            wrap.get('td:eq(0)').should('be.visible').click();
            cy.get('mat-dialog-container app-report-info-dialog app-status-chip').should('be.visible').then($chip => {
              const status = $chip.text();
              cy.wrap($chip).click();
              cy.intercept({
                method: 'PATCH',
                url: /^https\:\/\/smartpass\.app\/api\/prod\-us\-central\/v1\/event_reports\/\d+$/
              }).as('statuschange');
              cy.get('app-status-editor app-status-chip span:not([class~='+status+'])').click();
              cy.wait('@statuschange').its('response').then(res => {
                expect(res.headers).to.include({'content-type': 'application/json'});
                expect(res.statusCode).to.equal(200);
              });
            });         
            

            //click on passtile on popup
            if (hasPassTile) {
              cy.get('mat-dialog-container app-report-info-dialog app-pass-tile').should('be.visible').click();
              cy.get('app-pass-card').should('be.visible');
              cy.get('div[class~="cdk-overlay-backdrop"]').click({force: true, multiple: true});
              //
              // foud passtile on row then test it
              wrap.get('td:eq(3) > div.pass-icon').then($el => {
                if (!!$el) {
                  cy.wrap($el).click();
                  cy.get('app-pass-card').should('be.visible');
                  cy.get('div[class~="cdk-overlay-backdrop"]').click({force: true, multiple: true});
                }
              });
            }
          });
        }
      );
    });

    it('should search reports by status', () => {

      cy.intercept({
        method: 'GET',
        url: 'https://smartpass.app/api/prod-us-central/v1/event_reports?limit=**'
      }).as('eventreports');

      cy.get('app-filter-button').contains('status', {matchCase: false}).click(); 
      cy.get('mat-dialog-container app-status-filter').should('be.visible');
      cy.get('mat-dialog-container app-status-filter app-status-chip:eq(0)').click();
      cy.wait('@eventreports').its('response').then(res => {
        expect(res.headers).to.include({'content-type': 'application/json'});
        expect(res.statusCode).to.equal(200);
        expect(res.body.results.every(r => r.status === 'active')).to.be.true; 
        cy.get('app-filter-button').contains('status', {matchCase: false}).then($el => {
          const $close = $el.parent().find('img[class~="close-button"]');
          cy.wrap($close).should('be.visible');
        });
      });

      cy.get('app-filter-button').contains('status', {matchCase: false}).click(); 
      cy.get('mat-dialog-container app-status-filter').should('be.visible');
      cy.get('mat-dialog-container app-status-filter app-status-chip:eq(1)').click();
      cy.wait('@eventreports').its('response').then(res => {
        expect(res.headers).to.include({'content-type': 'application/json'});
        expect(res.statusCode).to.equal(200);
        expect(res.body.results.every(r => r.status === 'closed')).to.be.true; 
        cy.get('app-filter-button').contains('status', {matchCase: false}).then($el => {
          const $close = $el.parent().find('img[class~="close-button"]');
          cy.wrap($close).should('be.visible');
        });
      });

    });

});
