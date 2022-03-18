import * as PassFunctions from "../../support/functions/passes";

context('Hall Monitor Page', () => {
  /**
   * Page: /main/hallmonitor
   * User: Teacher
   */

  describe('Hall Monitor Page - DOM elements', () => {
    before(() => {
      // @ts-ignore
      cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
      cy.visit('http://localhost:4200/main/hallmonitor');
      cy.wait(5000);
    })

    it('should highlight the proper nav button', () => {
      cy.get('div.nav-button-wrapper').contains('Hall Monitor').siblings('div.selected-tab-pointer').should('exist');
    });

    it('should have a proper header', () => {
      const numberOfActivePasses = cy.$$('div.content app-pass-collection app-pass-tile div.tile-wrapper').length;

      const headerSelector = 'div.hall-monitor-wrapper div.header';
      cy.get(`${headerSelector} div.title`).should('contain.text', 'Hall Monitor');
      cy.get(`${headerSelector} div.search input.input`)
        .should('exist')
        .should('be.visible')
        .invoke('val').should('equal', '');

      cy.get(`${headerSelector} div.buttons app-white-button > div.wrapper`).should('exist').then(el => {
        expect(el.hasClass('disabled')).to.equal(numberOfActivePasses === 0)
      })

      cy.get(`${headerSelector} div.buttons app-square-button > div.wrapper`).should('exist').should('be.visible');
    });

    it('should have a proper Active Passes Section', () => {
      cy.get('div.content div.collection-title').should('contain.text', 'Active Passes');
      cy.get('div.content div.collection-title').should('exist').should('be.visible');
      const numberOfActivePasses = cy.$$('div.content app-pass-collection app-pass-tile div.tile-wrapper').length
      if (numberOfActivePasses === 0) {
        cy.get('div.content div.empty-container').should('exist').should('be.visible');
        cy.get('div.content div.empty-container img.empty-svg').should('exist').should('be.visible');
      }
    });
  });

  describe('Active Passes', () => {
    before(() => {
      // @ts-ignore
      cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
      cy.visit('http://localhost:4200/main/passes');
      cy.wait(5000);
    });

    it('should create a pass for a student and have it show on the hall monitor page', () => {
      expect(true).to.equal(true);
      PassFunctions.openCreatePassDialog('now');
      PassFunctions.searchForStudent('Demo Student1');
      cy.wait(200);
      PassFunctions.selectStudentFromSearchList('Demo Student1');
      cy.get(' div.content-right_next app-gradient-button > div').click();
      PassFunctions.selectCurrentRoom('Bathroom');
      cy.wait(500);
      PassFunctions.selectDestination('Nurse');
      cy.wait(500);
      PassFunctions.setMinimumPassDuration();
      PassFunctions.startPass();

      cy.visit('http://localhost:4200/main/hallmonitor');
      cy.wait(1000);
      cy.get('div.content app-pass-collection app-pass-tile div.tile-wrapper').should('have.length', 1);
    });

    it('should end a pass', () => {
      cy.get('div.collection-grid-wrapper app-pass-tile>div').first().click({force: true});
      cy.get('mat-dialog-container div.header-content app-icon-button>div').click();
      cy.get('app-consent-menu div.options-container > div:last-of-type > div').click();
    })
  })
})
