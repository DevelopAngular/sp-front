// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

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

// @ts-ignore
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('http://localhost:4200');
  submitUsername(username);
  cy.waitUntil(() => cy.get('div.input-password').should('have.css', 'opacity', '1'));
  submitPassword(password);
  cy.get('div.error').should('not.exist');
  cy.wait(10000);
});

// @ts-ignore
Cypress.Commands.add('logout', () => {
  cy.get('.options-wrapper div.wrapper').first().click();
  cy.wait(500);
  cy.get('div.sign-out').click();
  cy.wait(5000);
});
