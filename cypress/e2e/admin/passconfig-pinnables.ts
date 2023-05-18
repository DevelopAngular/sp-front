context('passconfig pinnables page', () => {
	enum VisibilitySetting {
		ALL_STUDENTS = 'Show room for all students',
		SHOW_CERTAIN_STUDENTS = 'Show room for certain students',
		HIDE_CERTAIN_STUDENTS = 'Hide room for certain students',
	}

	beforeEach(() => {
		cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
		cy.dataCy('passconfig-link').contains('Rooms').click();
	});

	const testFolder = 'test-fld';

	/*
	describe.skip('can add or remove a pinnable', () => {
		context('pinnable room', () => {
			const tempNewTestRoomName = 'temp-rm-new';
			const tempNewTestRoomNumber = 'TMP1';

			it('add pinnable room', () => {
				// click add button
				// click new room
				// set name
				// set room number
				// set travel type
				// set time limit
				// set color
				// set icon
				// set icon
				// set color
				savePinnable({ locationUpdate: false });
			})

			it('remove pinnable room', () => {
				// click pinnable
				// scroll to delete button
				// click delete button
				// click confirm delete button
			})
		})

		context('nested room', () => {
			const tempNewTestNestedRoomName = 'temp-nest-new';
			const tempNewTestNestedRoomNumber = 'TMP2';

			it('add nested room', () => {
				// click test folder
				// click add room
				// set name
				// set room number
				// set travel type
				// set time limit
				// click save
				savePinnable({ locationUpdate: false });
				// close test folder
			})

			it('remove nested room', () => {
				// click test folder
				// scroll to nested room
				// click nested room
				// scroll to delete button
				// click delete button
				// close test folder
			})
		})
		
		context('pinnable folder', () => {
			const tempNewTestFolder = 'temp-fld-new';

			it('add pinnable folder', () => {
				// click add button
				// click add folder
				// set name
				// set color
				// set icon
				// click save
			}) 

			it('remove pinnable folder', () => {
				// click pinnable folder
				// scroll to delete button
				// click delete button
				// click confirm delete button
			})
		})
	})
	*/

	describe('can modify the name', () => {
		context('pinnable room', () => {
			const nameTestRoom = 'test-rm-name';
			const tempNameTestRoom = 'temp-rm-name';

			it('change name to something else', () => {
				cy.dataCy('pinnable-tile').contains(nameTestRoom).click();
				changePinnableName(tempNameTestRoom);
				savePinnable({ locationUpdate: false });
			});

			it('check if name is changed', () => {
				cy.dataCy('pinnable-tile').contains(tempNameTestRoom).click();
				cy.dataCy('pinnable-close-btn').click();
			});

			it('change name back to original', () => {
				cy.dataCy('pinnable-tile').contains(tempNameTestRoom).click();
				changePinnableName(nameTestRoom);
				savePinnable({ locationUpdate: false });
			});
		});

		context.only('nested room', () => {
			const nameTestNestedRoom = 'test-nest-name';
			const tempNameTestNestedRoom = 'temp-nest-name';

			it('change name to something else', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(nameTestNestedRoom).click();
				// NOTE scrollBehavior is necessary due to some weird layout issue with the header
				cy.dataCy('pinnable-title-inp').clear({ scrollBehavior: false });
				cy.dataCy('pinnable-title-inp').type(tempNameTestNestedRoom, { scrollBehavior: false });
				cy.dataCy('room-in-folder-save-btn').click();
				cy.wait(500); // TODO bad practice
				savePinnable({ locationUpdate: true });
			});

			it('check if name is changed', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(tempNameTestNestedRoom).should('exist');
				cy.dataCy('pinnable-close-btn').click();
			});

			it('change name back to original', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(tempNameTestNestedRoom).click();
				// NOTE scrollBehavior is necessary due to some weird layout issue with the header
				cy.dataCy('pinnable-title-inp').clear({ scrollBehavior: false });
				cy.dataCy('pinnable-title-inp').type(nameTestNestedRoom, { scrollBehavior: false });
				cy.dataCy('room-in-folder-save-btn').click();
				cy.wait(500); // TODO bad practice
				savePinnable({ locationUpdate: true });
			});
		});

		context('pinnable folder', () => {
			const nameTestFolder = 'test-fld-name';
			const tempNameTestFolder = 'temp-fld-name';

			it('change name to something else', () => {
				cy.dataCy('pinnable-tile').contains(nameTestFolder).click();
				changePinnableName(tempNameTestFolder);
				savePinnable({ locationUpdate: false });
			});

			it('check if name is changed', () => {
				cy.dataCy('pinnable-tile').contains(tempNameTestFolder).click();
				cy.dataCy('pinnable-close-btn').click();
			});

			it('change name back to original', () => {
				cy.dataCy('pinnable-tile').contains(tempNameTestFolder).click();
				changePinnableName(nameTestFolder);
				savePinnable({ locationUpdate: false });
			});
		});
	});

	describe('can modify room visiblity settings', () => {
		context('pinnable room', () => {
			const visibilityTestRoom = 'test-rm-vis';

			it('use visibility dropdown to select student', () => {
				cy.dataCy('pinnable-tile').contains(visibilityTestRoom).click();
				cy.dataCy('visibility-dropdown').click();
				cy.contains(VisibilitySetting.SHOW_CERTAIN_STUDENTS).click();
				addVisibleStudents(['Demo Student1']);
				cy.dataCy('chip').contains('Demo Student1').should('exist');
				savePinnable({ locationUpdate: true });
			});

			it('check if visibility settings are saved', () => {
				cy.dataCy('pinnable-tile').contains(visibilityTestRoom).click();
				cy.dataCy('visibility-dropdown').contains('Show for certain students').should('exist');
				cy.dataCy('chip').contains('Demo Student1').should('exist');
				cy.dataCy('pinnable-close-btn').click();
			});

			it('reset visibility settings', () => {
				cy.dataCy('pinnable-tile').contains(visibilityTestRoom).click();
				resetVisiblitySettings();
				savePinnable({ locationUpdate: true });
			});
		});

		context('nested room', () => {
			const visibilityTestNestedRoom = 'test-nest-vis';

			it('use visibility dropdown to select student', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(visibilityTestNestedRoom).click();

				cy.dataCy('visibility-dropdown').click();
				cy.contains(VisibilitySetting.SHOW_CERTAIN_STUDENTS).click();
				addVisibleStudents(['Demo Student1']);
				cy.dataCy('chip').contains('Demo Student1').should('exist');
				cy.dataCy('room-in-folder-save-btn').click();
				cy.wait(500); // TODO bad practice
				savePinnable({ locationUpdate: true });
			});

			it('check if visibility settings are saved', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(visibilityTestNestedRoom).click();

				cy.dataCy('visibility-dropdown').contains('Show for certain students').should('exist');
				cy.dataCy('chip').contains('Demo Student1').should('exist');

				cy.dataCy('room-in-folder-back-btn').click();
				cy.dataCy('pinnable-close-btn').click();
			});

			it('reset visibility settings', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(visibilityTestNestedRoom).click();

				resetVisiblitySettings();

				cy.dataCy('room-in-folder-save-btn').click();
				cy.wait(500); // TODO bad practice
				savePinnable({ locationUpdate: true });
			});
		});
	});

	describe('can modify teacher room assignment', () => {
		const testTeacher = 'demoteacher1';

		context('pinnable room', () => {
			const teacherTestRoom = 'test-rm-teach';

			it('add teacher to room', () => {
				cy.dataCy('pinnable-tile').contains(teacherTestRoom).click();
				addPinnableTeacherAssignment(testTeacher);
				savePinnable({ locationUpdate: true });
			});

			it('check if teacher is added', () => {
				cy.dataCy('pinnable-tile').contains(teacherTestRoom).click();
				cy.dataCy('chip').should('exist');
				cy.dataCy('pinnable-close-btn').click();
			});

			it('remove teacher from room', () => {
				cy.dataCy('pinnable-tile').contains(teacherTestRoom).click();
				removePinnableTeacherAssignment();
				savePinnable({ locationUpdate: true });
			});

			it('check if teacher is removed', () => {
				cy.dataCy('pinnable-tile').contains(teacherTestRoom).click();
				cy.dataCy('chip').should('not.exist');
				cy.dataCy('pinnable-close-btn').click();
			});
		});

		context('nested room', () => {
			const teacherTestNestedRoom = 'test-nest-teach';

			it('add teacher to room', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(teacherTestNestedRoom).click();

				addPinnableTeacherAssignment(testTeacher);

				cy.dataCy('room-in-folder-save-btn').click();
				cy.wait(500); // TODO bad practice
				savePinnable({ locationUpdate: true });
			});

			it('check if teacher is added', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(teacherTestNestedRoom).click();

				cy.dataCy('chip').should('exist');

				cy.dataCy('room-in-folder-back-btn').click();
				cy.dataCy('pinnable-close-btn').click();
			});

			it('remove teacher from room', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(teacherTestNestedRoom).click();

				removePinnableTeacherAssignment();

				cy.dataCy('room-in-folder-save-btn').click();
				cy.wait(500); // TODO bad practice
				savePinnable({ locationUpdate: true });
			});

			it('check if teacher is removed', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.dataCy('room-in-folder').contains(teacherTestNestedRoom).click();

				cy.dataCy('chip').should('not.exist');

				cy.dataCy('room-in-folder-back-btn').click();
				cy.dataCy('pinnable-close-btn').click();
			});
		});
	});

	describe('can modify the icon', () => {
		context('pinnable room', () => {
			const iconTestRoom = 'test-rm-icon';

			it('select a new icon', () => {
				cy.dataCy('pinnable-tile').contains(iconTestRoom).click();
				cy.wait(500); // TODO bad practice
				setPinnableIcon();
				savePinnable({ locationUpdate: false });
			});
		});

		context('pinnable folder', () => {
			it('select a new icon', () => {
				cy.dataCy('pinnable-tile').contains(testFolder).click();
				cy.wait(500); // TODO bad practice
				setPinnableIcon();
				savePinnable({ locationUpdate: false });
			});
		});
	});
});

function savePinnable(props: { locationUpdate: boolean }) {
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

function changePinnableName(name: string) {
	cy.dataCy('pinnable-title-inp').clear();
	cy.dataCy('pinnable-title-inp').type(name);
	cy.wait(500); // TODO bad practice
}

function addPinnableTeacherAssignment(teacherName: string) {
	cy.dataCy('teacher-search').click();
	cy.dataCy('search-inp').type(teacherName);
	cy.dataCy('search-result-user').contains(teacherName).click();
}

function removePinnableTeacherAssignment() {
	cy.dataCy('chip')
		.first()
		.each((e) => {
			cy.wrap(e).trigger('mouseenter');
			cy.dataCy('chip-delete-btn').click();
		});
}

function addVisibleStudents(names: string[]) {
	names.forEach((name) => {
		cy.dataCy('visibility-student-search').click();
		cy.dataCy('visibility-student-search').type(name);
		cy.dataCy('search-result-user').contains(name).click();
	});
}

function resetVisiblitySettings() {
	cy.contains('Visibility').click(); // scroll to this section
	// Delete all the chips
	cy.dataCy('chip').each((e) => {
		cy.wrap(e).trigger('mouseenter');
		cy.dataCy('chip-delete-btn').click();
	});

	cy.dataCy('visibility-dropdown').click();
	cy.contains('Show room for all students').click(); // TODO bad practice; change to dataCy tag
}

function setPinnableIcon() {
	cy.dataCy('icon-search').type('{a}');
	cy.wait(500); // TODO bad practice
	cy.dataCy('icon-search-result').first().click();
}
