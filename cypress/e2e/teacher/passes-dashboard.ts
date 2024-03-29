import * as PassFunctions from '../../support/functions/passes';

/**
 * Responsible for all interactions a teacher can make on the main dashboard page
 */

describe('Teacher - Passes Dashboard', () => {
  // useful functions to execute on the student passes dashboard
  const nextStep = () => {
    cy.get(' div.content-right_next app-gradient-button > div').click();
  };

  beforeEach(() => {
    // @ts-ignore
    cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
    cy.visit('/main/passes');
  });

  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      // @ts-ignore
      Cypress.runner.stop();
    }
  });

  describe('Pass Management', () => {
    describe('Now Passes', () => {
      beforeEach(() => {
        if (cy.$$('div.end-pass-content').length) {
          cy.get('div.end-pass-content').click();
          cy.wait(500);
        }
      });

      afterEach(() => {
        cy.wait(100);
      });

      after(() => {
        const numberOfActivePasses = cy.$$('div.active-passes app-pass-tile>div').length;
        for (let i = 0; i < numberOfActivePasses; i++) {
          cy.get('div.active-passes app-pass-tile>div').first().click({force: true});
          cy.get('mat-dialog-container div.header-content app-icon-button>div').click();
          cy.get('app-consent-menu div.options-container > div:last-of-type > div').click();
        }

        // cy.get('').each(el => {
        //   el.trigger('click');
        //   cy.get('mat-dialog-container div.header-content app-icon-button>div').click();
        //   cy.get('app-consent-menu div.options-container > div:last-of-type > div').click();
        // }).click({force: true});
      });

      it('should create "Now" pass for a student', () => {
        PassFunctions.openCreatePassDialog('now');
        PassFunctions.searchForStudent('Demo Student1');
        cy.wait(200);
        PassFunctions.selectStudentFromSearchList('Demo Student1');
        nextStep();
        PassFunctions.selectCurrentRoom('Bathroom');
        cy.wait(500);
        PassFunctions.selectDestination('Nurse');
        cy.wait(500);
        PassFunctions.setMinimumPassDuration();
        PassFunctions.startPass();
      });

      it('should end an active pass for a student', () => {
        cy.get('div.active-passes app-pass-tile>div').first().click({force: true});
        cy.get('mat-dialog-container div.header-content app-icon-button>div').click();
        cy.get('app-consent-menu div.options-container > div:last-of-type > div').click();
      });

      it('should send a pass to 2 students', () => {
        PassFunctions.openCreatePassDialog('now');
        PassFunctions.searchForStudent('Demo Student1');
        cy.wait(200);
        PassFunctions.selectStudentFromSearchList('Demo Student1');
        PassFunctions.searchForStudent('Demo Student2');
        cy.wait(200);
        PassFunctions.selectStudentFromSearchList('Demo Student2');
        nextStep();
        PassFunctions.selectCurrentRoom('Bathroom');
        cy.wait(500);
        PassFunctions.selectDestination('Nurse');
        cy.wait(500);
        PassFunctions.setMinimumPassDuration();
        PassFunctions.startPass();
      });

      it('should end an expired pass for a student', () => {
        cy.wait(1000);
        // The test before this one should have successfully set a pass for 2 students
        // Wait for any one of them to expire and end the pass
        cy.clock(Date.now());
        cy.tick(60000);
        cy.wait(100);
        cy.get('div.active-passes app-pass-tile>div').first().click({force: true});
        cy.get('mat-dialog-container div.header-content app-icon-button>div').first().click();
        cy.get('app-consent-menu div.options-container > div:last-of-type span').contains('End Pass').click();
      });
    });
  });
});
