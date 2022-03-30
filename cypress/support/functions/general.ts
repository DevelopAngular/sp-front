export const closeModal = () => {
  cy.get('div.cdk-overlay-backdrop.custom-backdrop').click({force: true});
  cy.wait(1000);
};

export const waitForElement = (selector: string) => cy.waitUntil(() => cy.get(selector));
