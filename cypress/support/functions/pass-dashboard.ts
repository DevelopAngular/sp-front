export const openCreatePassDialog = (passType: 'now' | 'future') => {
  passType === 'now'
    ? cy.get('app-create-pass-button>div').first().click({force: true})
    : cy.get('app-create-pass-button>div').last().click({force: true})
}

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
}
