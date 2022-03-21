Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Login Page', () => {
  let containerElement: JQuery<HTMLElement>;
  before(() => {
    cy.visit('http://localhost:4200');
    cy.wait(1000);
    cy.get('.container').then(el => {
      containerElement = el;
    });
  });

  describe('Contains the proper DOM elements', () => {
    let loginForm: JQuery<HTMLElement>;
    before(() => {
      loginForm = containerElement.find('.login-form');
    });
    it('should contain the proper Background DOM', () => {
      expect(containerElement.find('.background')).not.to.equal(null);
      expect(containerElement.find('.brand app-smartpass-logo .container .logo-wrapper img')).not.to.equal(null);
      expect(containerElement.find('.moving-tiles app-mooving-tiles')).not.to.equal(null);
    });
    it('should contain the proper Login DOM', () => {
      expect(loginForm.find('.title').text()).to.equal('Sign In');
      expect(loginForm.find('.content app-input div.InputWrapper label').first().text().trim()).to.equal('Username or email');
      expect(loginForm.find('.input-password')).not.to.equal(null);
      expect(loginForm.find('.input-password').css('opacity')).to.equal('0');
      expect(loginForm.find('div.button')).not.to.equal(null);
      expect(loginForm.find('div.button > app-gradient-button > div.button').hasClass('disabled')).to.equal(true);
    });
  });

  describe('Actions', () => {
    const submit = () => {
      cy.get('div.button > app-gradient-button > div.button').click({force: true});
    };

    const clearEmail = () => {
      /**
       * Why not just clear the input?
       *
       * The state of the form should be reset before/after each test. If a previous test
       * checks for the presence of an error message, simply clearing the input won't get rid
       * of the error message (based on the current component setup). The error message goes away
       * after the error is present, the input has lost focus, regains focus and a new value is put in.
       * The input can now be cleared.
       */
      cy.get('div.input-container input[autocomplete="username"]').clear().type('a').clear();
    };
    const clearPassword = () => {
      cy.get('div.input-container input[autocomplete="password"]').clear().type('a').clear();
    };
    beforeEach(() => {
      clearEmail();
      clearPassword();
    });
    describe('Email Login', () => {
      it('should do nothing if the button is clicked while disabled', () => {
        submit();
        cy.url().should('equal', 'http://localhost:4200/');
        cy.get('div.error').should('not.exist');
      });

      it('should display an error if the email is incorrect', () => {
        cy.get('div.input-container input[autocomplete="username"]').type('bad-email');
        cy.get('div.button > app-gradient-button > div.button').should('not.have.class', 'disabled');
        submit();
        cy.get('div.error').should('exist').should('contain.text', 'Couldn\'t find that username or email');
      });

      it('should not display an error and display the password input if the email is correct', () => {
        cy.get('div.input-container input[autocomplete="username"]').focus().type(Cypress.env('studentUsername'));
        submit();
        cy.get('div.button > app-gradient-button > div.button').should('not.have.class', 'disabled');
        submit();
        cy.get('div.error').should('not.exist');
      });

      it('should display an error for invalid credentials', () => {
        cy.get('div.input-container input[autocomplete="username"]').focus().type(Cypress.env('studentUsername'));
        submit();
        cy.get('div.input-container input[autocomplete="password"]').focus().type('bad password');
        submit();
        cy.get('div.error').should('exist').should('contain.text', 'Please sign in again.');
      });

      it('should redirect for correct email/password credentials', () => {
        cy.get('div.input-container input[autocomplete="username"]').type(Cypress.env('studentUsername'));
        submit();
        cy.get('div.input-container input[autocomplete="password"]').type(Cypress.env('studentPassword'));
        submit();
        cy.get('div.error').should('not.exist');
        cy.wait(10000);
        cy.url().should('equal', 'http://localhost:4200/main/passes');
      });
    });
  });
});

