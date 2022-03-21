export const closeModal = () => {
  cy.get('div.cdk-overlay-backdrop.custom-backdrop').click({force: true});
}

