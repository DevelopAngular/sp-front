import * as PassDashboard from '../../support/functions/pass-dashboard'

/**
 * Responsible for all interactions a teacher can make on the main dashboard page
 */

describe('Teacher - Passes Dashboard', () => {
  // useful functions to execute on the student passes dashboard
  const searchForStudent = (studentName: string) => {
    cy.get('app-round-input input[placeholder="Search students"]').type(studentName);
  };

  const selectStudentFromSearchList = (studentName: string) => {
    cy.get('div.option-list_item').click({multiple: true});
  };

  const nextStep = () => {
    cy.get(' div.content-right_next app-gradient-button > div').click();
  };

  const searchForCurrentRoom = (roomName: string) => {
    cy.get('app-round-input input').type(roomName);
  };

  const selectCurrentRoom = (roomName: string) => {
    cy.get('app-location-cell div.info').contains(roomName).click({force: true});
  };

  const selectDestination = (roomName: string) => {
    cy.get('mat-grid-tile > figure > app-pinnable > div:not(.isSameRoom)').contains(roomName).click();
  };

  const cancelModal = () => {
    cy.get('div.cdk-overlay-backdrop.custom-backdrop').click({force: true});
  };

  const startPass = () => {
    cy.get('div.start-pass-content').click({force: true});
  };

  const getActivePasses = (): number => {
    return cy.$$('div.active-passes > app-pass-collection > div.collection-wrapper  app-pass-tile').length;
  }

  before(() => {
    // @ts-ignore
    cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
    cy.visit('http://localhost:4200/main/passes');
    cy.wait(5000);
  });

  describe('Pass Management', () => {
    beforeEach(() => {
      if (cy.$$('div.end-pass-content').length) {
        cy.get('div.end-pass-content').click();
        cy.wait(500);
      }
    });

    afterEach(() => {
      cy.wait(100);
    })
    it('should create a "Now" pass for a student', () => {
      PassDashboard.openCreatePassDialog('now');
      searchForStudent('Sally Vango');
      cy.wait(200);
      selectStudentFromSearchList('Sally Vango');
      nextStep();
      selectCurrentRoom('Bathroom');
      cy.wait(500);
      selectDestination('Nurse');
      cy.wait(500);
      PassDashboard.setMinimumPassDuration();
      startPass();
    });

    it('should end an active pass for a student', () => {
      cy.get('div.active-passes app-pass-tile>div').first().click({force: true});
      cy.get('mat-dialog-container div.header-content app-icon-button>div').click();
      cy.get('app-consent-menu div.options-container > div:last-of-type > div').click();
    });
    //
    it('should send a pass to 2 students', () => {
      PassDashboard.openCreatePassDialog('now');
      searchForStudent('Sally Vango');
      cy.wait(200);
      selectStudentFromSearchList('Sally Vango');
      searchForStudent('d3');
      cy.wait(200);
      selectStudentFromSearchList('d3');
      nextStep();
      selectCurrentRoom('Bathroom');
      cy.wait(500);
      selectDestination('Nurse');
      cy.wait(500);
      PassDashboard.setMinimumPassDuration();
      startPass();
    })

    it('should end an expired pass for a student', () => {
      // The test before this one should have successfully set a pass for 2 students
      // Wait for any one of them to expire and end the pass
      cy.clock(Date.now())
      cy.tick(60000)
      cy.wait(100);
      cy.get('div.active-passes app-pass-tile>div').first().click({force: true});
      cy.get('mat-dialog-container div.header-content app-icon-button>div').click();
      cy.get('app-consent-menu div.options-container > div:last-of-type > div').click();
    });
  });
});
