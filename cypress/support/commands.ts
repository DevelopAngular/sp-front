import 'cypress-wait-until'
import { AuthType, DiscoverServerResponse } from '../../src/app/services/http-service'

const pressLoginSubmitButton = () => {
  cy.get('app-gradient-button > div.button:not(.disabled)').click({force: true});
};

Cypress.Commands.add('enterUsername', (username: string) => {
  // cy.intercept('GET', '/api/discovery/email_info*', ).as('emailCheck');
  cy.intercept({
    method: 'GET',
    url: '/api/discovery/email_info*',
  }, (request) => {
    request.reply(response => {
      const { auth_types, auth_providers } = response.body as DiscoverServerResponse;
      if (auth_types.includes(AuthType.Google)) {
        // response.headers['Location'] = ''
      }
    })
  }).as('emailCheck');
  cy.get('div.input-container input[autocomplete="username"]').type(username);
  pressLoginSubmitButton();
  cy.wait('@emailCheck');
});

Cypress.Commands.add('enterPassword', (password: string) => {
  cy.intercept({
    method: 'POST',
    url: '/api/discovery/v2/find'
  }).as('findServer');
  cy.get('div.input-container input[autocomplete="password"]').type(password);
  pressLoginSubmitButton();
  cy.wait('@findServer');
  cy.get('@findServer.all').then(xhr => { // it should only be called once
    expect(xhr.length).to.equal(1);
  })
});

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session([username, password], () => {
    cy.intercept({
      method: 'POST',
      url: '/api/**/sessions'
    }).as('sessions');

    cy.intercept({
      method: 'POST',
      url: 'https://api-iam.intercom.io/messenger/web/ping'
    }).as('intercom');

    cy.visit('/');
    cy.enterUsername(username);
    cy.waitUntil(() => cy.get('div.input-password').should('have.css', 'opacity', '1'));
    cy.enterPassword(password);
    cy.get('div.error').should('not.exist');
    cy.wait('@sessions', {timeout: 20000});
    cy.get('@sessions.all').then(xhr => { // it should only be called once
      expect(xhr.length).to.equal(1);
    })
    cy.wait('@intercom', {timeout: 20000});
    cy.wait(2000);
  })
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

Cypress.Commands.add('switchSchool', (name: string = 'Cypress Testing School 1') => {
  cy.get('app-school-toggle-bar div.selected-school').click();
  cy.get('app-dropdown').should('be.visible');
  cy.get('app-dropdown div.option-data').should('have.length.at.least', 2);
  cy.get('app-dropdown').contains(name).parent().parent().click();
});


