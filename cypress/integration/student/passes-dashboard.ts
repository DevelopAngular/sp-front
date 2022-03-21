import * as PassFunctions from '../../support/functions/passes';
import * as moment from 'moment';

/**
 * Responsible for all interactions a student can make on the main dashboard page
 */

describe('Student - Passes Dashboard', () => {
  // useful functions to execute on the student passes dashboard
  const searchForCurrentRoom = (roomName: string) => {
    cy.get('app-round-input input').type(roomName);
  };

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
  }

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

      it('should mark an expired pass as "Expiring"', () => {
        cy.clock(Date.now());
        cy.tick(60000);
        cy.wait(1000);
        cy.get('app-inline-pass-card div.end-pass-content').should('have.class', 'isExpiring');
      });

      it('should expire the pass if the buffer time has passed', () => {
        const expiredPasses = cy.$$('div.past-passes.pass-collection app-pass-collection app-pass-tile > div.tile-wrapper').length;
        const now = new Date();
        const futureBufferDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
        cy.clock(Date.now());
        cy.tick(3600000) // an hour
        // expect(cy.$$('div.past-passes.pass-collection app-pass-collection app-pass-tile > div.tile-wrapper').length).to.equal(expiredPasses + 1);
        cy.get('app-create-pass-button>div').should('exist').should('be.visible');
      });

      it('should be able to end a pass', () => {
        endPass();
      })
    });

    describe('Future Passes', () => {
      let scheduledDate: Date;
      before(() => {
        if (cy.$$('div.end-pass-content').length) {
          endPass();
          cy.wait(500);
        }
      });

      it('should create a scheduled pass', () => {
        const numberOfScheduledPasses = cy.$$('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper').length;
        const todayMoment = moment();
        while (todayMoment.isoWeekday() !== 1) {
          todayMoment.add(1, 'day')
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
        cy.get('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper').should('have.length', numberOfScheduledPasses + 1);
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
        const numberOfScheduledPasses = cy.$$('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper').length;
        cy.get('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper').first().click({force: true});
        cy.get('div.pass-card-header app-icon-button > div.icon-button-container').click();
        cy.get('div.options-container').contains('Delete Scheduled Pass').parent().click();
        cy.get('div.future-passes.pass-collection > app-pass-collection app-pass-tile > div.tile-wrapper').should('have.length', numberOfScheduledPasses - 1);
      })
    })

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
});
