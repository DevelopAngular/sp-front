import * as PassFunctions from '../../support/functions/passes';
import * as HelperFunctions from '../../support/functions/general';
import * as moment from 'moment';
import {closeModal} from '../../support/functions/general';

/**
 * Responsible for all interactions a student can make on the main dashboard page
 */

describe('Student - Passes Dashboard', () => {
  // useful functions to execute on the student passes dashboard
  const selectCurrentRoom = (roomName: string) => {
    cy.get('app-location-cell div.info').contains(roomName).click({force: true});
  };

  const selectDestination = (roomName: string) => {
    cy.get('mat-grid-tile > figure > app-pinnable > div:not(.isSameRoom)').contains(roomName).click();
  };

  const startPass = () => {
    cy.get('div.start-pass-content').click({force: true});
  };

  const endPass = () => {
    cy.get('div.end-pass-content').click({force: true});
  };

  const cleanupFuturePasses = () => {
    cy.wait(5000);
    cy.log('Clean out scheduled passes on the student side');
    const futurePasses = cy.$$('div.future-passes app-pass-collection div.tile-wrapper');
    if (futurePasses.length > 0) {
      // for (let i = 0; i < futurePasses.length; i++) {
      //   cy.get('div.future-passes.pass-collection div.tile-wrapper').first().click({force: true});
      //   const scheduledWasCreatedByStudent = cy.$$('div.pass-card-header app-icon-button > div.icon-button-container').length > 0;
      //   if (scheduledWasCreatedByStudent) {
      //     cy.get('div.pass-card-header app-icon-button > div.icon-button-container').eq(0).click({force: true});
      //     cy.get('div.options-container').contains('Delete Scheduled Pass').parent().click();
      //     cy.wait('@deletePass');
      //     cy.wait(
      //   } else {
      //     closeModal();
      //   }
      // }
      cy.get('div.future-passes.pass-collection div.tile-wrapper').each(el => {
        cy.get('div.future-passes.pass-collection div.tile-wrapper').first().click();
        const scheduledWasCreatedByStudent = cy.$$('div.pass-card-header app-icon-button > div.icon-button-container').length > 0;
        if (scheduledWasCreatedByStudent) {
          cy.wait('@deletePass');
          cy.get('div.pass-card-header app-icon-button > div.icon-button-container').eq(0).click({force: true});
          cy.get('div.options-container').contains('Delete Scheduled Pass').parent().click();
        } else {
          closeModal();
        }
      });
    }
    cy.log('Logging out student');
    cy.logoutStudent();

    cy.log('Clean out scheduled passes on the teacher side');
    cy.log('Logging in teacher');
    cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
    if (cy.$$('div.end-pass-content').length) {
      endPass();
      cy.wait(500);
    }
    cy.intercept({
      method: 'POST',
      url: 'https://smartpass.app/api/prod-us-central/v1/hall_passes/**'
    }).as('deletePass');

    const teacherFuturePassesExist = cy.$$('div.future-passes app-pass-collection div.tile-wrapper').length > 0;
    if (teacherFuturePassesExist) {
      cy.get('div.future-passes.pass-collection div.tile-wrapper').each(el => {
        cy.get('div.future-passes.pass-collection div.tile-wrapper').first().click();
        cy.get('div.pass-card-header app-icon-button > div.icon-button-container').eq(0).click({force: true});
        cy.get('div.options-container').contains('Delete Scheduled Pass').parent().click();
        cy.wait('@deletePass');
      });
    }

    // cy.get('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper').should('have.length', 0);
    cy.logoutTeacher(); cy.login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));
  };

  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      // @ts-ignore
      Cypress.runner.stop();
    }
  });

  /** Dashboard DOM checks. When performing DOM checks, ensure at the very least that the element
   * exists and the text is correct
   * TODO: Check for the presence of elements
   *  - Toolbar
   *  - Pass creation buttons
   *    - Now
   *    - Future
   *  - Previous Passes
   *  - Section of Pass Requests
   *  - User name in top right
   *  - Settings button
   *  - Settings menu items
   */

  describe('Pass Management', () => {
    before(() => {
      cy.login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));
    });

    describe('Now Passes', () => {
      // end any existing passes before the test suite starts
      before(() => {
        if (cy.$$('div.end-pass-content').length) {
          endPass();
          cy.wait(500);
        }
      });

      it('should be able to create a one-way pass', () => {
        expect(true).to.equal(true);
        PassFunctions.openCreatePassDialog('now');
        cy.wait(500);
        selectCurrentRoom('Bathroom');
        cy.wait(500);
        selectDestination('Nurse');
        cy.wait(500);

        PassFunctions.setMinimumPassDuration();
        startPass();
        cy.get('app-inline-pass-card').should('exist').should('have.length', 1);
      });

      it('should not be able to create a pass if a pass is in progress', () => {
        cy.get('app-create-pass-button>div').should('not.exist');
      });

      it('should be able to end a pass', () => {
        const expiredPasses = cy.$$('div.past-passes.pass-collection app-pass-collection app-pass-tile > div.tile-wrapper').length;
        endPass();
        cy.get('app-create-pass-button>div').should('exist').should('be.visible');
        cy.get('div.past-passes.pass-collection app-pass-collection app-pass-tile > div.tile-wrapper')
          .should('have.length', expiredPasses + 1);
      });

      it('should mark an expired pass as "Expiring"', () => {
        PassFunctions.openCreatePassDialog('now');
        cy.wait(500);
        selectCurrentRoom('Bathroom');
        cy.wait(500);
        selectDestination('Nurse');
        cy.wait(500);

        PassFunctions.setMinimumPassDuration();
        startPass();
        cy.wait(1000);
        cy.clock(Date.now());
        cy.tick(80000);
        cy.wait(1000);
        cy.get('app-inline-pass-card div.end-pass-content')
          .should('have.class', 'isExpiring')
          .should('contain.text', '- End Pass');

        endPass();
      });
    });

    describe('Future Passes', () => {
      let scheduledDate: Date;

      before(() => {
        cleanupFuturePasses();
      });

      after(() => {
        cleanupFuturePasses();
      });

      it('should create a scheduled pass', () => {
        const numberOfScheduledPasses = cy
          .$$('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper')
          .length;
        const todayMoment = moment();
        while (todayMoment.isoWeekday() !== 1) {
          todayMoment.add(1, 'day');
        }

        scheduledDate = todayMoment.toDate();
        PassFunctions.openCreatePassDialog('future');
        cy.get('div.week-date > div.date-text').contains(scheduledDate.getDate()).click({force: true});
        cy.get('div.hours > input.timeInput').clear().type('10');
        cy.get('div.minutes > input.timeInput').clear().type('0');
        cy.get('div.format[draggable="false"]').then(el => {
          if (el.text() === 'PM') {
            el.trigger('click');
          }
        });
        cy.get('div.next-button > app-gradient-button > div.button').click();
        selectCurrentRoom('Bathroom');
        cy.wait(500);
        selectDestination('Water Fountain');
        cy.wait(500);

        PassFunctions.setMinimumPassDuration();
        startPass();
        cy
          .get('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper')
          .should('have.length', numberOfScheduledPasses + 1);
      });

      /**
       * This test should rely on the mocking of web sockets to manually set a pass over to the active state
       */
      // it('should move the scheduled pass to active after some time', () => {
      //   cy.clock(scheduledDate);
      //   cy.tick(61000);
      //   cy.wait(100);
      //   cy.get('app-inline-pass-card').should('exist').should('have.length', 1);
      // });

      it('should delete the scheduled pass', () => {
        const numberOfScheduledPasses = cy
          .$$('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper')
          .length;
        cy.get('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper').first().click({force: true});
        cy.get('div.pass-card-header app-icon-button > div.icon-button-container').click();
        cy.get('div.options-container').contains('Delete Scheduled Pass').parent().click();
        cy
          .get('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper')
          .should('have.length', numberOfScheduledPasses - 1);
      });
    });

    /** Now Cards - Actions and UX
     * These may be separate tests or multiple of these may be tested in a single test
     * Due to the nature of some of these tests, the text and presences of elements
     * should also be checked at least once.
     *
     * TODO: A student should be able to create a round-trip pass (Action)
     * TODO: A student should be able to select a destination, go back and select a new destination (UX)
     * TODO: A student should be able to expand and collapse the pass creation card (UX)
     * TODO: A student should be able to close the pass creation card from the back button (UX)
     */

    /** Future Cards - Actions and UX
     * TODO: A student should not be able to create a card for a previous date (UX)
     * TODO: A student should be able to select the time using the cursor
     * TODO: A student should be able to type in a valid time
     * TODO: A student should be able to create a future card
     * TODO: A student should be able to send a request to a teacher
     *
     */

    describe.skip('Request "Now" Pass', () => {
      const requestPassMessage = 'Some Message';
      const deniedPassMessage = 'Denied due to reasons';

      after(() => {
        cy.get('div.pass-card-header app-icon-button div.icon-button-container').click({force: true});
        cy.get('app-consent-menu div.option-wrapper').contains('Delete Pass Request').parent().click({force: true});
      });

      it('should request a pass with a message', () => {
        cy.intercept({
          method: 'GET',
          url: 'https://smartpass.app/api/prod-us-central/v1/**'
        }).as('v1API');
        PassFunctions.openCreatePassDialog('now');
        PassFunctions.selectCurrentRoom('Bathroom');
        cy.get('img[alt="LOCK"].lock', { timeout: 10000 }).then(el => {
          el.first().parent().trigger('click');
        });
        PassFunctions.searchForTeacher('demoteacher1');
        cy.get('textarea.message-box').type(requestPassMessage);
        cy.get('div.rest-mes-content app-gradient-button div.button').click();
        PassFunctions.setMinimumPassDuration();
        cy.get('div.request-button-content').click();
        cy.wait('@v1API', {timeout: 20000});
        cy.get('app-inline-request-card')
          .should('exist')
          .should('be.visible')
          .should('have.length', 1);
      });

      /**
       * Ideally, we should mock the web-socket connection and manually pass in a
       * pass.request.accept message but, at the time of writing this, it's currently
       * difficult to justifiably mock the websocket connection.
       *
       * The following test will have to perform of accepting a student pass request manually and then
       * log back into the student's portal to check if the pass was accepted.
       *
       * Note that this test is flaky at best but there currently isn't an easy way to mock
       * the code.
       */
      it('should receive an accepted "Now" pass request', () => {
        cy.logoutStudent(); cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
        cy.intercept({
          method: 'GET',
          url: 'https://smartpass.app/api/prod-us-central/v1/**'
        }).as('v1API');
        const numberOfActivePasses = PassFunctions.getActivePasses();
        // if the previous test has passed, then there should be a request
        cy.get('div.main-page-right app-pass-tile div.tile-wrapper').first().click();
        cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});
        cy.get('app-request-card div.message span').last().should('have.text', requestPassMessage);
        cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});
        cy.get('app-request-card div.resend-button-content').click();
        cy.wait('@v1API', {timeout: 20000});
        cy
          .get('div.active-passes > app-pass-collection > div.collection-wrapper  app-pass-tile')
          .should('have.length', numberOfActivePasses + 1);
        cy.logoutTeacher();
        cy.login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));
        cy.get('app-inline-pass-card')
          .should('exist')
          .should('be.visible')
          .should('have.length', 1);
      });

      it('should end an active pass from an accepted pass request', () => {
        endPass();
      });

      it('should receive a denied pass request', () => {
        cy.intercept({
          method: 'GET',
          url: 'https://smartpass.app/api/prod-us-central/v1/**'
        }).as('v1API');
        PassFunctions.openCreatePassDialog('now');
        PassFunctions.selectCurrentRoom('Bathroom');
        cy.get('img[alt="LOCK"].lock', { timeout: 10000 }).then(el => {
          el.first().parent().trigger('click');
        });
        PassFunctions.searchForTeacher('demoteacher1');
        cy.get('textarea.message-box').type(requestPassMessage);
        cy.get('div.rest-mes-content app-gradient-button div.button').click();
        PassFunctions.setMinimumPassDuration();
        cy.get('div.request-button-content').click();
        cy.wait('@v1API', {timeout: 20000});
        cy.get('app-inline-request-card')
          .should('exist')
          .should('be.visible')
          .should('have.length', 1);

        // @ts-ignore
        cy.logoutStudent(); cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
        cy.get('div.main-page-right app-pass-tile div.tile-wrapper').first().click();
        cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});
        cy.get('app-request-card div.message span').last().should('have.text', requestPassMessage);
        cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});

        cy.get('app-request-card div.header-content app-icon-button div.icon-button-container').first().click();
        cy.get('app-consent-menu div.option-wrapper').contains('Deny Pass Request').parent().click();
        cy.wait('@v1API', {timeout: 20000});

        cy.logoutTeacher();
        cy.login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));

        cy.get('app-inline-request-card')
          .should('exist')
          .should('be.visible')
          .should('have.length', 1);

        cy.get('app-inline-request-card div.resend-button-content')
          .should('exist')
          .should('be.visible')
          .should('have.length', 1);

        cy.get('app-inline-request-card div.resend-button-content-subtitle').should('have.text', 'Pass Request Denied');
      });

      it('should re-try a denied pass request', () => {
        cy.get('app-inline-request-card div.resend-button-content')
          .should('exist')
          .should('be.visible')
          .should('have.length', 1)
          .click({force: true});

        cy.get('app-inline-request-card div.resend-button-content-title').should('contain.text', 'Enter Teacher Pin');
        cy.get('app-inline-request-card div.resend-button-content div.description-title').should('exist');
      });

      it('should receive a denied pass request with a message', () => {
        cy.intercept({
          method: 'GET',
          url: 'https://smartpass.app/api/prod-us-central/v1/**'
        }).as('v1API');
        cy.logoutStudent(); cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
        cy.get('div.main-page-right app-pass-tile div.tile-wrapper').first().click();
        cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});
        cy.get('app-request-card div.message span').last().should('have.text', requestPassMessage);
        cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});

        cy.get('app-request-card div.header-content app-icon-button div.icon-button-container').first().click();
        cy.get('app-consent-menu div.option-wrapper').contains('Attach Message & Deny').parent().click();

        cy.get('div.content-wrapper textarea').clear().type(deniedPassMessage);
        cy.get('div.rest-mes-wrapper app-gradient-button div.button').click({force: true});
        cy.wait('@v1API', {timeout: 20000});

        cy.logoutTeacher();
        cy.login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));

        cy.get('app-inline-request-card')
          .should('exist')
          .should('be.visible')
          .should('have.length', 1);

        cy.get('app-inline-request-card div.resend-button-content')
          .should('exist')
          .should('be.visible')
          .should('have.length', 1);

        cy.get('app-inline-request-card div.resend-button-content-subtitle').should('have.text', 'Pass Request Denied');
      });
    });

    describe.skip('Request "Future" Pass', () => {
      const studentName = 'Demo Student2';
      let scheduledDate: Date;

      before(() => {
        cy.logoutStudent();
        cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
      });

      beforeEach(() => {
        scheduledDate = undefined;
      });

      it('(Teacher) should create a declinable scheduled pass for a student', () => {
        cy.intercept({
          method: 'GET',
          url: 'https://smartpass.app/api/prod-us-central/v1/**'
        }).as('v1API');
        const todayMoment = moment();
        while (todayMoment.isoWeekday() !== 1) {
          todayMoment.add(1, 'day');
        }
        scheduledDate = todayMoment.toDate();
        const numberOfRequests = cy.$$('div.requests-or-invitations app-pass-tile').length;

        PassFunctions.openCreatePassDialog('future');
        PassFunctions.searchForStudent(studentName);
        HelperFunctions.waitForElement('div.option-list_scrollable > div.option-list_item');
        PassFunctions.selectStudentFromSearchList(studentName);
        cy.get(' div.content-right_next app-gradient-button > div').click();
        HelperFunctions.waitForElement('div.time-picker');
        cy.get('div.week-date > div.date-text').then(el => {
          el.toArray().filter(e => e.innerText === scheduledDate.getDate().toString()).slice(-1)[0].click();
        });

        cy.get('div.hours > input.timeInput').clear().type('10');
        cy.get('div.minutes > input.timeInput').clear().type('0');
        cy.get('div.format[draggable="false"]').then(el => {
          if (el.text() === 'PM') {
            el.trigger('click');
          }
        });
        cy.get('div.next-btn > app-gradient-button > div.button').click();
        HelperFunctions.waitForElement('div.pinnable-card');
        PassFunctions.selectDestination('Main Office');
        HelperFunctions.waitForElement('div.rest-mes-wrapper textarea');
        cy.get('div.rest-mes-wrapper div > app-gradient-button > div.button').click();
        HelperFunctions.waitForElement('mat-slider');
        PassFunctions.setMinimumPassDuration();
        cy.get('div.card-button-container div.button-content').click();
        cy.wait('@v1API', {timeout: 20000});
        cy.get('div.requests-or-invitations app-pass-tile').should('have.length', numberOfRequests + 1);
      });

      it('(Student) should decline a declinable request pass from teacher', () => {
        cy.intercept({
          method: 'GET',
          url: 'https://smartpass.app/api/prod-us-central/v1/**'
        }).as('v1API');
        cy.logoutTeacher();
        cy.login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));
        const numberOfRequests = cy.$$('div.requests-or-invitations app-pass-tile').length;
        cy.get('div.requests-or-invitations app-pass-tile div.tile-wrapper').first().click();
        cy.wait('@v1API', {timeout: 20000});
        HelperFunctions.waitForElement('div.pass-card-header app-icon-button');
        cy.get('div.pass-card-header app-icon-button div.icon-button-container').click();
        cy.get('div.options-container div.option-wrapper').contains('Decline Pass Request').parent().click();
        cy.get('div.requests-or-invitations app-pass-tile').should('have.length', numberOfRequests - 1);

        // cy.logoutStudent();
        // cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
        // HelperFunctions.waitForElement('div.requests-or-invitations div.tile-subtitle');
        // cy.get('div.tile-subtitle').contains('Declined').should('have.length.at.least', 1);
        // cy.get('div.requests-or-invitations app-pass-tile div.tile-wrapper').first().click();
        // HelperFunctions.waitForElement('div.pass-card-header app-icon-button');
        // cy.get('div.pass-card-header app-icon-button div.icon-button-container').click();
        // cy.get('app-consent-menu div.option-wrapper').contains('Delete Pass Request').parent().click();
      });
      //
      it('(Teacher) should create a non-declinable scheduled pass for a student', () => {
        cy.intercept({
          method: 'GET',
          url: 'https://smartpass.app/api/prod-us-central/v1/**'
        }).as('v1API');
        cy.logoutStudent();
        cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
        // should have a declined pass request from the previous test
        const todayMoment = moment();
        while (todayMoment.isoWeekday() !== 1) {
          todayMoment.add(1, 'day');
        }
        scheduledDate = todayMoment.toDate();
        const numberOfRequests = cy.$$('div.future-passes app-pass-tile').length;

        PassFunctions.openCreatePassDialog('future');
        PassFunctions.searchForStudent(studentName);
        HelperFunctions.waitForElement('div.option-list_scrollable > div.option-list_item');
        PassFunctions.selectStudentFromSearchList(studentName);
        cy.get(' div.content-right_next app-gradient-button > div').click();
        HelperFunctions.waitForElement('div.time-picker');
        cy.get('div.checkbox-container label.checkbox-label').click();
        cy.get('div.week-date > div.date-text').contains(scheduledDate.getDate()).click({force: true});
        cy.get('div.hours > input.timeInput').clear().type('10');
        cy.get('div.minutes > input.timeInput').clear().type('0');
        cy.get('div.format[draggable="false"]').then(el => {
          if (el.text() === 'PM') {
            el.trigger('click');
          }
        });
        cy.get('div.next-btn > app-gradient-button > div.button').click();
        HelperFunctions.waitForElement('app-round-input');
        PassFunctions.selectCurrentRoom('Bathroom');
        HelperFunctions.waitForElement('div.pinnable-card');
        PassFunctions.selectDestination('Main Office');
        HelperFunctions.waitForElement('div.rest-mes-wrapper textarea');
        cy.get('div.rest-mes-wrapper div > app-gradient-button > div.button').click();
        HelperFunctions.waitForElement('mat-slider');
        PassFunctions.setMinimumPassDuration();
        startPass();
        cy.wait('@v1API', {timeout: 20000});
        cy.get('div.future-passes app-pass-tile').should('have.length', numberOfRequests + 1);
        cy.logoutTeacher();
        cy.login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));
        cy.wait('@v1API', {timeout: 20000});
      });
    });
  });

  describe('Multiple Schools', () => {
    before(() => {
      cy.login(Cypress.env('student1Username'), Cypress.env('student1Password'));
    });

    it('should toggle between mutiple schools', () => {
      // check if the toggle is there
      cy
        .get('app-school-toggle-bar > div.school-toggle-bar-wrapper')
        .should('have.length', 1)
        .should('be.visible');

      cy.get('app-school-toggle-bar div.selected-school').click({force: true});
      // At least 2 schools should be shown here. If there was only one school shown, then the student
      // would only belong to a single school, which means the top bar won't have been shown in the first place
      cy.get('div.options-wrapper div.option').should('have.length.at.least', 2);
      cy.get('div.option-data:not(.current-school)').click();
      cy.wait(1000);
      cy.get('app-school-toggle-bar span.school-name').should('have.text', 'Cypress Testing School 1');

      // // it should be able to switch back to the previous school
      cy.get('app-school-toggle-bar div.selected-school').click({force: true});
      cy.get('div.options-wrapper div.option').should('have.length.at.least', 2);
      cy.get('div.option-data').contains('Cypress Testing School 2').parent().parent().click();
      cy.wait(1000);
      cy.get('app-school-toggle-bar span.school-name').should('have.text', 'Cypress Testing School 2');
    });
  });
});
