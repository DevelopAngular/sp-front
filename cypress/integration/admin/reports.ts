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

  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      // @ts-ignore
      Cypress.runner.stop();
    }
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

    it('should navigate to reports', () => {

      cy.intercept({
        method: 'GET',
        url: 'https://smartpass.app/api/prod-us-central/v1/event_reports?limit=**'
      }).as('eventreports');
      
      getExplorePanel().click().then(
        () => {
          getReports().click();
          cy.wait('@eventreports');
        });
    });

    it('should opens pass popup', () => {

      // try to find an a row with a pass tile
      cy.get('app-sp-data-table table tbody tr').then($rows => {
        //cy.wrap($rows[0]).waitUntil(jel => jel.get(0).isConnected);

        const maybePassTiles = $rows.find('td div.pass-icon:eq(0)');
        const hasPassTile = maybePassTiles.length > 0;

        if (hasPassTile) {
          // foud passtile on row then test it
          cy.wrap(maybePassTiles[0]).click();
          cy.get('app-pass-card').should('be.visible');
          cy.get('div[class~="cdk-overlay-backdrop"]').should('exist').click({force: true});
        }
      })
    });

    it('should opens report popup', () => {
        cy.get('app-sp-data-table table tbody tr').then($rows => {
          //cy.wrap($rows[0]).waitUntil(jel => jel.get(0).isConnected);

          const maybePassTiles = $rows.find('td div.pass-icon:eq(0)');
          const hasPassTile = maybePassTiles.length > 0;

          if (hasPassTile) {
            const $td = maybePassTiles[0].closest('tr').querySelector('td:nth-child(1)');
            cy.log($td);
            cy.wrap($td).click({force: true});
            //click on passtile on popup
            cy.get('mat-dialog-container app-report-info-dialog app-pass-tile div.tile-title-container').should('be.visible').click();
            cy.get('app-pass-card').should('be.visible');
            cy.get('div[class~="cdk-overlay-backdrop"]').should('exist').click({force: true, multiple: true});
          }
        });
    });

    it('should change report status from report popup', () => {
      cy.get('app-sp-data-table table tbody tr').then($rows => {
        const $td = $rows[0].querySelector('td:nth-child(1)');
        cy.wrap($td).click({force: true});
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
            const status = res.body.status;
            cy.get('app-report-info-dialog app-status-chip span:eq(0)').should('have.text', status);
            cy.get('div[class~="cdk-overlay-backdrop"]').should('exist').click({force: true, multiple: true});
          });
        });         
      });
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
