declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<Element>

    login(username: string, password: string): Chainable;
    logoutStudent(): Chainable;
    logoutTeacher(): Chainable;
    logoutAdmin(): Chainable;
    switchSchool(name?: string): Chainable;
  }
}
