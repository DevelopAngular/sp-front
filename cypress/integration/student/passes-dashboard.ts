import * as PassFunctions from '../../support/functions/passes';
import * as moment from 'moment';

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
    cy.get('div.end-pass-content').click();
  };

  before(() => {
    // @ts-ignore
    cy.login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));
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
    describe.skip('Now Passes', () => {
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

      it('should mark an expired pass as "Expiring"', () => {
        cy.clock(Date.now());
        cy.tick(60000);
        cy.wait(1000);
        cy.get('app-inline-pass-card div.end-pass-content').should('have.class', 'isExpiring');
      });

      it('should expire the pass if the buffer time has passed', () => {
        const expiredPasses = cy.$$('div.past-passes.pass-collection app-pass-collection app-pass-tile > div.tile-wrapper').length;
        cy.clock(Date.now());
        cy.tick(3600000); // an hour
        cy.get('div.past-passes.pass-collection app-pass-collection app-pass-tile > div.tile-wrapper')
          .should('have.length', expiredPasses + 1);
        cy.get('app-create-pass-button>div').should('exist').should('be.visible');
      });

      it('should be able to end a pass', () => {
        endPass();
      });
    });

    describe.skip('Future Passes', () => {
      let scheduledDate: Date;
      before(() => {
        if (cy.$$('div.end-pass-content').length) {
          endPass();
          cy.wait(500);
        }
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
  });

  describe.only('Request Pass', () => {
    const requestPassMessage = 'Some Message';
    const deniedPassMessage = 'Denied due to reasons';

    after(() => {
      cy.get('div.pass-card-header app-icon-button div.icon-button-container').click({force: true});
      cy.get('app-consent-menu div.option-wrapper').contains('Delete Pass Request').parent().click({force: true});
    })

    it('should request a "now" pass with a message', () => {
      cy.visit('http://localhost:4200/main/passes');
      PassFunctions.openCreatePassDialog('now');
      PassFunctions.selectCurrentRoom('Bathroom');
      cy.get('img[alt="LOCK"].lock').parent().click();
      PassFunctions.searchForTeacher('demoteacher1');
      cy.get('textarea.message-box').type(requestPassMessage);
      cy.get('div.rest-mes-content app-gradient-button div.button').click();
      PassFunctions.setMinimumPassDuration();
      cy.get('div.request-button-content').click();
      cy.wait(1000);
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
      // @ts-ignore
      cy.logout(); cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));

      const numberOfActivePasses = PassFunctions.getActivePasses();
      // if the previous test has passed, then there should be a request
      cy.get('div.main-page-right app-pass-tile div.tile-wrapper').first().click();
      cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});
      cy.get('app-request-card div.message span').last().should('have.text', requestPassMessage);
      cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});
      cy.get('app-request-card div.resend-button-content').click();
      cy
        .get('div.active-passes > app-pass-collection > div.collection-wrapper  app-pass-tile')
        .should('have.length', numberOfActivePasses + 1);

      cy.get('.options-wrapper div.icon-button-container').first().click();
      cy.get('div.sign-out').click();
      cy.wait(5000);
      // @ts-ignore
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
      PassFunctions.openCreatePassDialog('now');
      PassFunctions.selectCurrentRoom('Bathroom');
      cy.get('img[alt="LOCK"].lock').parent().click();
      PassFunctions.searchForTeacher('demoteacher1');
      cy.get('textarea.message-box').type(requestPassMessage);
      cy.get('div.rest-mes-content app-gradient-button div.button').click();
      PassFunctions.setMinimumPassDuration();
      cy.get('div.request-button-content').click();
      cy.wait(1000);
      cy.get('app-inline-request-card')
        .should('exist')
        .should('be.visible')
        .should('have.length', 1);

      // @ts-ignore
      cy.logout(); cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
      cy.get('div.main-page-right app-pass-tile div.tile-wrapper').first().click();
      cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});
      cy.get('app-request-card div.message span').last().should('have.text', requestPassMessage);
      cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});

      cy.get('app-request-card div.header-content app-icon-button div.icon-button-container').first().click();
      cy.get('app-consent-menu div.option-wrapper').contains('Deny Pass Request').parent().click();

      cy.get('.options-wrapper div.icon-button-container').first().click();
      cy.get('div.sign-out').click();
      cy.wait(5000);
      // @ts-ignore
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
      // @ts-ignore
      cy.logout(); cy.login(Cypress.env('teacherUsername'), Cypress.env('teacherPassword'));
      cy.get('div.main-page-right app-pass-tile div.tile-wrapper').first().click();
      cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});
      cy.get('app-request-card div.message span').last().should('have.text', requestPassMessage);
      cy.get('app-request-card div.paginator-button app-icon-button div.icon-button-container').click({force: true});

      cy.get('app-request-card div.header-content app-icon-button div.icon-button-container').first().click();
      cy.get('app-consent-menu div.option-wrapper').contains('Attach Message & Deny').parent().click();

      cy.get('div.content-wrapper textarea').clear().type(deniedPassMessage);
      cy.get('div.rest-mes-wrapper app-gradient-button div.button').click({force: true});

      cy.get('.options-wrapper div.icon-button-container').first().click();
      cy.get('div.sign-out').click();
      cy.wait(5000);
      // @ts-ignore
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
});
