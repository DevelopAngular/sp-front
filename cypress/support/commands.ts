import 'cypress-wait-until';

const pressLoginSubmitButton = () => {
  cy.get('app-gradient-button > div.button:not(.disabled)').click({force: true});
};

const submitUsername = (username: string) => {
  cy.intercept({
    method: 'GET',
    url: '/api/discovery/email_info*'
  }).as('emailCheck');
  cy.get('div.input-container input[autocomplete="username"]').type(username);
  pressLoginSubmitButton();
  cy.wait('@emailCheck');
};

const submitPassword = (password: string) => {
  cy.intercept({
    method: 'POST',
    url: '/api/discovery/v2/find'
  }).as('credentialCheck');
  cy.get('div.input-container input[autocomplete="password"]').type(password);
  pressLoginSubmitButton();
  cy.wait('@credentialCheck');
};

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.intercept({
    method: 'POST',
    url: 'https://smartpass.app/api/prod-us-central/o/token/**'
  }).as('token');

  cy.intercept({
    method: 'GET',
    url: 'https://smartpass.app/api/prod-us-central/v1/**'
  }).as('v1API');

  cy.intercept({
    method: 'POST',
    url: 'https://api-iam.intercom.io/messenger/web/ping'
  }).as('intercom');

  cy.visit('http://localhost:4200');
  submitUsername(username);
  cy.waitUntil(() => cy.get('div.input-password').should('have.css', 'opacity', '1'));
  submitPassword(password);
  cy.get('div.error').should('not.exist');
  cy.wait('@token', {timeout: 20000});
  cy.wait('@v1API', {timeout: 20000});
  cy.wait('@intercom', {timeout: 20000});
  cy.wait(2000);
});

Cypress.Commands.add('logoutStudent', () => {
  cy.get('.options-wrapper div.wrapper').first().click();
  cy.wait(500);
  cy.get('div.sign-out').click();
  cy.wait(5000);
});

Cypress.Commands.add('logoutTeacher', () => {
  cy.get('.options-wrapper div.icon-button-container').first().click();
  cy.get('div.sign-out').click();
  cy.wait(5000);
});

Cypress.Commands.add('logoutAdmin', () => {
  // the concrete div.icon-button-container seems to properly trigger click event
  cy.get('app-nav app-icon-button div.icon-button-container').click({force: true});
  cy.get('app-root mat-dialog-container > app-settings div.sign-out', {timeout: 1000}).click({force: true});
  cy.wait(2500);
});

Cypress.Commands.add('switchSchool', (name: string) => {
  cy.get('app-school-toggle-bar div.selected-school').click();
  cy.get('app-dropdown').should('be.visible');
  cy.get('app-dropdown div.option-data').should('have.length.at.least', 2);
  cy.get('app-dropdown').contains(name).parent().parent().click();
});


