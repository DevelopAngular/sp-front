export const closeModal = () => {
  cy.get('div.cdk-overlay-backdrop.custom-backdrop').click({force: true, multiple: true});
  cy.wait(1000);
};

export const waitForElement = (selector: string, timeout: number = 20000) => cy.waitUntil(() => cy.get(selector), {timeout});

export const searchForStudent = (spSearchSelector: string, studentName: string) => {
  cy.intercept({
    method: 'GET',
    url: '**/users?role=_profile_student**'
  }).as('searchstudents');
  cy.get(spSearchSelector).find('app-round-input input').type(studentName);
  cy.wait('@searchstudents', {timeout: 10000});
};

export const getNavAction = (label: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get('app-nav app-nav-button', {timeout: 10000}).contains(label);
};
