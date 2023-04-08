// Updating pinnables and their settings

describe('updating pinnables and their settings', function() {
  beforeEach( function() {
    cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
    cy.visit('/admin/passconfig');
  });

  const testUpdatingFolderName = 'test-upd-folder';

  context('can change the title', function() {
    context('of a pinnable location', function() {
      const testUpdateTitlePinnableName = 'test-upd-name';
      const newName = 'new-location';

      it('should be able to change the name to something else', function() {
        clickPinnableWithTitle(testUpdateTitlePinnableName);
        changePinnableTitle(newName);
        savePinnable({locationUpdate: false});
      })

      it('should maintain its new name', function() {
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
      const testUpdateTitleFolderName = 'test-upd-fld-name';
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
    context('Pinnable Location', function() {
      const visibilityTestPinnableName = 'test-upt-visib';

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
      const visibilityTestRoomInFolderName = 'test-upd-visib';

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

  context('can change teacher assignment', function() {
    const teacherName = 'demoteacher1';

    context('Pinnable Location', function() {
      const testUpdateAssignmentPinnableName = 'test-upd-assign';

      it('should be able to add a teacher to a room', function() {
        clickPinnableWithTitle(testUpdateAssignmentPinnableName);
        addPinnableTeacherAssignment(teacherName);
        savePinnable({locationUpdate: false});
      })

      it('should still show the teacher when reopening the pinnable', function() {
        clickPinnableWithTitle(testUpdateAssignmentPinnableName);
        checkPinnableTeacherAssignment(teacherName);
        closePinnable();
      })

      it('should be able to remove a teacher from a room', function() {
        clickPinnableWithTitle(testUpdateAssignmentPinnableName);
        removePinnableTeacherAssignment(teacherName);
        savePinnable({locationUpdate: false});
      })

      it('should not show the teacher when reopening the pinnable', function() {
        clickPinnableWithTitle(testUpdateAssignmentPinnableName);
        checkPinnableTeacherNoAssignment(teacherName);
        closePinnable();
      })
    })

    context('Pinnable Folder', function() {
      const testUpdateAssignmentRoomInFolderName = 'test-upd-asgn';

      it('should be able to add a teacher to a room', function() {
        clickPinnableWithTitle(testUpdatingFolderName);
        clickRoomInFolder(testUpdateAssignmentRoomInFolderName);

        addPinnableTeacherAssignment(teacherName);

        saveRoomInFolder();
        savePinnable({locationUpdate: true});
      })

      it('should still show the teacher when reopening the pinnable', function() {
        clickPinnableWithTitle(testUpdatingFolderName);
        clickRoomInFolder(testUpdateAssignmentRoomInFolderName);

        checkPinnableTeacherAssignment(teacherName);

        closeRoomInFolder();
        closePinnable();
      })

      it('should be able to remove a teacher from a room', function() {
        clickPinnableWithTitle(testUpdatingFolderName);
        clickRoomInFolder(testUpdateAssignmentRoomInFolderName);

        removePinnableTeacherAssignment(teacherName);

        saveRoomInFolder();
        savePinnable({locationUpdate: true});
      })

      it('should not show the teacher when reopening the pinnable', function() {
        clickPinnableWithTitle(testUpdatingFolderName);
        clickRoomInFolder(testUpdateAssignmentRoomInFolderName);

        checkPinnableTeacherNoAssignment(teacherName);

        closeRoomInFolder();
        closePinnable();
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

function addPinnableTeacherAssignment(teacherName: string) {
  cy.dataCy('teacher-search').click();
  cy.dataCy('search-inp').type(teacherName);
  cy.dataCy('search-result-user').contains(teacherName).click();
}

function checkPinnableTeacherAssignment(teacherName: string) {
  cy.dataCy('chip').should('exist');
}

function checkPinnableTeacherNoAssignment(teacherName: string) {
  cy.dataCy('chip').should('not.exist');
}

function removePinnableTeacherAssignment(teacherName: string) {
  cy.dataCy('chip').each(e => {
    cy.wrap(e).trigger('mouseenter');
    cy.dataCy('chip-delete-btn').click();
  })
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
