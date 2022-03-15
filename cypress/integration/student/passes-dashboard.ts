/**
 * Responsible for all interactions a student can make on the main dashboard page
 */

describe('Student - Passes Dashboard', () => {
  // useful functions to execute on the student passes dashboard
  const clickOnNowPass = () => {
    cy.get('app-create-pass-button>div').first().click({force: true});
  };

  const clickOnFuturePass = () => {
    cy.get('app-create-pass-button>div').last().click({force: true});
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
   *  - User name in top rioht
   *  - Settings button
   *  - Settings menu items
   */

  describe('Pass Management', () => {
    beforeEach(() => {
      if (cy.$$('div.end-pass-content').length) {
        cy.get('div.end-pass-content').click();
        cy.wait(500);
      }
    });
    it('should be able to create a one-way pass', () => {
      expect(true).to.equal(true);

      clickOnNowPass();
      selectCurrentRoom('Bathroom');
      cy.wait(500);
      selectDestination('Nurse');
      cy.wait(500);
      /**
       * Since there's currently some bugs in Cypress around the dragging of elements,
       * the arrows will be used to set the duration slider down to a single minute
       */
      cy.get('mat-slider').type(new Array(50).fill('{downArrow}').join());
      startPass();
      cy.get('app-inline-pass-card').should('exist').should('have.length', 1);
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
});
