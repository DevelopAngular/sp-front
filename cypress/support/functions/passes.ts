export const openCreatePassDialog = (passType: 'now' | 'future') => {
  passType === 'now'
    ? cy.get('app-create-pass-button:eq(0)>div').first().click({force: true})
    : cy.get('app-create-pass-button:eq(1)>div').last().click({force: true});
};

/**
 * Since there's currently some bugs in Cypress around the dragging of elements,
 * the arrows will be used to set the duration slider down to a single minute
 */
export const setMinimumPassDuration = () => {
  const slider = cy.get('mat-slider');
  /**
   * Using `cy.get('mat-slider').type(new Array(60).fill('{downArrow}').join());` would
   * definitely have been ideal. However, for this version of Cypress, running above command
   * triggers the settings menu to open. It's unclear as to why this happens, but
   * the following code seems to avoid that from happening.
   */
  for (let i = 0; i < 30; i++) {
    // Pressing the down arrow button twice, 30 times should reduce
    // any pass time starting at less than 60 minutes down to 1 minute.
    slider.type('{downArrow}{downArrow}');
  }
};

export const searchForStudent = (studentName: string) => {
  cy.get('app-round-input input[placeholder="Search students"]').type(studentName);
};

export const selectStudentFromSearchList = (studentName: string) => {
  cy.get('div.option-list_item').click({multiple: true});
};

export const searchForCurrentRoom = (roomName: string) => {
  cy.get('app-round-input input').type(roomName);
};

export const selectCurrentRoom = (roomName: string) => {
  cy.get('app-location-cell div.info').contains(roomName).click({force: true});
};

export const selectDestination = (roomName: string) => {
  cy.get('mat-grid-tile > figure > app-pinnable > div:not(.isSameRoom)').contains(roomName).click();
};

export const startPass = () => {
  cy.get('div.start-pass-content').click({force: true});
};

export const getActivePasses = (): number => {
  return cy.$$('div.active-passes > app-pass-collection > div.collection-wrapper  app-pass-tile').length;
};

export const searchForTeacher = (teacherName: string) => {
  cy.get('input[placeholder="Search teachers"]').type(teacherName);
  cy.get('div.option-list_item').contains(teacherName).parent().click();
};
