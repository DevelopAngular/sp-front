declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    login(username: string, password: string): Chainable;
    logoutStudent(): Chainable;
    logoutTeacher(): Chainable;
    logoutAdmin(): Chainable;
    switchSchool(name?: string): Chainable;
  }
}
