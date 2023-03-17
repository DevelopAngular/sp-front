// Updating pinnables and their settings

describe('updating pinnables and their settings', function() {
  beforeEach( function() {
    cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
    cy.visit('/admin/passconfig');
  });

  const testUpdatingFolderName = 'test-upd-folder'

  context('can change the title', function() {

    const testUpdateTitlePinnableName = 'test-upd-name';
    const testUpdateTitleFolderName = 'test-upd-fld-name';

    context('of a pinnable location', function() {
      const newName = 'new-location';

      it('should be able to change the name to something else', function() {
        clickPinnableWithTitle(testUpdateTitlePinnableName);
        changePinnableTitle(newName);
        savePinnable({locationUpdate: false});
      })

      it('maintain its new name', function() {
        clickPinnableWithTitle(newName);
        closePinnable();
      })

      it('be able to change it back', function() {
        clickPinnableWithTitle(newName);
        changePinnableTitle(testUpdateTitlePinnableName);
        savePinnable({locationUpdate: false});
      })
    });

    context('of a pinnable folder', function() {
      const newName = 'new-folder';

      it('should be able to change the name to something else', function() {
        clickPinnableWithTitle(testUpdateTitleFolderName);
        changePinnableTitle(newName);
        savePinnable({locationUpdate: false});
      })

      it('maintain its new name', function() {
        clickPinnableWithTitle(newName);
        closePinnable();
      })

      it('be able to change it back', function() {
        clickPinnableWithTitle(newName);
        changePinnableTitle(testUpdateTitleFolderName);
        savePinnable({locationUpdate: false});
      })
    })
  })

  context('can update room visiblity settings', function() {
    const visibilityTestPinnableName = 'test-upt-visib';
    const visibilityTestRoomInFolderName = 'test-upd-visib';

    context('Pinnable Location', function() {

      it('should be able to select show room for certain students with a specific student', () => {
        clickPinnableWithTitle(visibilityTestPinnableName);

        selectVisiblitySetting(VisibilitySetting.SHOW_CERTAIN_STUDENTS);
        addVisibleStudents(['Demo Student1']);
        cy.dataCy('chip').contains('Demo Student1').should('exist');
        savePinnable({locationUpdate: true});
      })

      it('should show the same settings when the pinnable is re-opened', function() {
        clickPinnableWithTitle(visibilityTestPinnableName);
        cy.dataCy('visibility-dropdown').contains('Show for certain students').should('exist');
        cy.dataCy('chip').contains('Demo Student1').should('exist');
        closePinnable();
      })

      it('should be able to reset the visibility setting', function() {
        clickPinnableWithTitle(visibilityTestPinnableName);
        resetVisiblitySettings();
        savePinnable({locationUpdate: true});
      })
    })

    context('Pinnable Folder', function() {

      it('should be able to select show room for certain students with a specific student', function() {
        clickPinnableWithTitle(testUpdatingFolderName);
        clickRoomInFolder(visibilityTestRoomInFolderName);

        selectVisiblitySetting(VisibilitySetting.SHOW_CERTAIN_STUDENTS);
        addVisibleStudents(['Demo Student1']);
        cy.dataCy('chip').contains('Demo Student1').should('exist');
        saveRoomInFolder();
        savePinnable({locationUpdate: true});
      })

      it('reopening the pinnable should show the same settings', function() {
        clickPinnableWithTitle(testUpdatingFolderName);
        clickRoomInFolder(visibilityTestRoomInFolderName);

        cy.dataCy('visibility-dropdown').contains('Show for certain students').should('exist');
        cy.dataCy('chip').contains('Demo Student1').should('exist');

        closeRoomInFolder();
        closePinnable();
      })

      it('should be able to reset the visibility setting', function() {
        clickPinnableWithTitle(testUpdatingFolderName);
        clickRoomInFolder(visibilityTestRoomInFolderName);

        resetVisiblitySettings();

        saveRoomInFolder();
        savePinnable({locationUpdate: true});
      })
    })
  })
})


function clickPinnableWithTitle(title: string) {
  cy.dataCy('pinnable-tile').contains(title).click();
}

function savePinnable(props: {locationUpdate: boolean}) {
  if (props.locationUpdate) {
    cy.intercept('PATCH', '**/locations/**').as('patchLocation');
  } else {
    cy.intercept('PATCH', '**/pinnables/**').as('patchPinnable');
  }


  cy.dataCy('pinnable-save-btn').click();

  if (props.locationUpdate) {
    cy.wait('@patchLocation');
  } else {
    cy.wait('@patchPinnable');
  }
}

function closePinnable() {
  cy.dataCy('pinnable-close-btn').click();
}

function changePinnableTitle(newTitle: string) {
  cy.dataCy('pinnable-title-inp').clear();
  cy.dataCy('pinnable-title-inp').type(newTitle);
  cy.wait(300);
}

function clickRoomInFolder(roomName: string) {
  cy.dataCy('room-in-folder').contains(roomName).click();
}

function saveRoomInFolder() {
  cy.dataCy('room-in-folder-save-btn').click();
  cy.wait(1000);
}

function closeRoomInFolder() {
  cy.dataCy('room-in-folder-back-btn').click();
}

enum VisibilitySetting {
  ALL_STUDENTS = 'Show room for all students',
  SHOW_CERTAIN_STUDENTS = 'Show room for certain students',
  HIDE_CERTAIN_STUDENTS = 'Hide room for certain students'
}

function selectVisiblitySetting(setting: VisibilitySetting) {
  cy.dataCy('visibility-dropdown').click();
  cy.contains(setting).click();
}

function addVisibleStudents(names: String[]) {
  names.forEach(name => {
    cy.dataCy('visibility-student-search').click();
    cy.dataCy('visibility-student-search').type(name);
    cy.dataCy('search-result-user').contains(name).click();
  })
}

function resetVisiblitySettings() {
  cy.contains('Visibility').click(); // scroll to this section
  // Delete all the chips
  cy.dataCy('chip').each(e => {
    cy.wrap(e).trigger('mouseenter');
    cy.dataCy('chip-delete-btn').click();
  })

  cy.dataCy('visibility-dropdown').click();
  cy.contains('Show room for all students').click();
}
