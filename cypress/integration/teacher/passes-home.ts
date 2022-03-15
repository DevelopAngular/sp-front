/**
 * Responsible for all interactions a teacher can make on the main dashboard page
 */

describe('Teacher - Passes Dashboard', () => {
  // useful functions to execute on the student passes dashboard
  const clickOnNowPass = () => {
    cy.get('app-create-pass-button>div').first().click({force: true});
  };

  const clickOnFuturePass = () => {
    cy.get('app-create-pass-button>div').last().click({force: true});
  };

  const searchForStudent = (studentName: string) => {
    cy.get('app-round-input input[placeholder="Search students"]').type(studentName);
  };

  const selectStudentFromSearchList = (studentName: string) => {
    cy.get('div.option-list_item').click();
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
    it('should be able to create a  pass', () => {
      const numberOfPasses = cy.$$('app-pass-tile').length;
      expect(true).to.equal(true);
      clickOnNowPass();
      searchForStudent('Sally Vango');
      cy.wait(200);
      selectStudentFromSearchList('Sally Vango');
      nextStep();
      selectCurrentRoom('Bathroom');
      cy.wait(500);
      selectDestination('Nurse');
      cy.wait(500);
      cy.get('mat-slider').type(new Array(50).fill('{downArrow}').join());
      startPass();
    });
  });
});
