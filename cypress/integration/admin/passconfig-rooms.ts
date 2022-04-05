import { closeModal } from '../../support/functions/general';
import * as PassFunctions from '../../support/functions/passes';

const defaultRoomNames = ['Bathroom', 'Water Fountain', 'Nurse', 'Guidance', 'Main Office', 'Library'];

// needs to be modifiable as when a test retry
// to avoid server existent room error
const ROOM_TITLE = 'CyRoom';
const MODIFIED_TITLE = 'CyChangedRoom';

const ROOM_NUM = '42';
const MODIFIED_ROOM_NUM = '24';

const ROOM_TIME = '2';
const MODIFIED_ROOM_TIME = '1';

const TRAVEL_TYPE_INDEX = 1; // One-way
const MODIFIED_TRAVEL_TYPE_INDEX = 0; // Round-trip
const MODIFIED_TRAVEL_TYPE = 'Round-trip';

const PASSES_LIMIT = '10';
const MODIFIED_PASSES_LIMIT = '5';

describe('Admin - UI and Actions',  () => {
    afterEach(function() {
      /**
       * No matter where the test fails:
       * - Log out
       * - Log in as the admin
       * - Delete the created rooms (CyRoom and CyChangedRoom)
       * - stop the runner
       */
      if (this.currentTest.state === 'failed') {
        cy.url().then(url => {
          if (url.includes('main/passes')) {
            // you're logged in as either a teacher or a student
            if (cy.$$('app-navbar app-smartpass-search').length > 0) {
              // you're logged in as a teacher
              cy.logoutTeacher();
              return Promise.resolve('teacher');
            } else {
              cy.logoutStudent();
              return Promise.resolve('student');
              // you're logged in as a student
            }
          }
          return Promise.resolve('admin');
        }).then(user => {
          if (user !== 'admin') {
            return cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
          }

          return Promise.resolve();
        }).then(() => {
          chooseDemoSchool();
          getNavAction('Rooms').click();

          cy.intercept({
            method: 'DELETE',
            url: /api\/prod-us-central\/v1\/pinnables\/\d+$/
          }).as('deleteRoomRequest');

          cy.get('div.pinnable-card div.title').each(el => {
            const title = el.text().trim();
            if (title !== ROOM_TITLE && title !== MODIFIED_TITLE) {
              return;
            }

            el.parent().parent().parent().trigger('click');
            cy
              .get('mat-dialog-container > app-overlay-container app-room app-gradient-button').contains('Delete room')
              .click({force: true});
            cy.wait('@deleteRoomRequest');
          });
        }).then(() => {
          // @ts-ignore
          Cypress.runner.stop();
        });
      }
    });

    const timeout = 10000;
    // just visiting admin urls will not work
    const getNavAction = (label: string): Cypress.Chainable<JQuery<HTMLElement>> => {
        return cy.get('app-nav app-nav-button',  {timeout}).contains(label);
    };

    const getRoomAction = (label: string): Cypress.Chainable<JQuery<HTMLElement>> => {
        return cy.get('app-pass-congif app-gradient-button').contains(label);
    };

    const getConsentAction = (label: string): Cypress.Chainable<JQuery<HTMLElement>> => {
        return cy.get('mat-dialog-container > app-consent-menu').contains(label);
    };

    const openAddRoomDialog = () => {
        getRoomAction('Add').click();
        getConsentAction('New Room').click();
    };

    const randomIndexElement = (selector: string): Cypress.Chainable<JQuery<HTMLElement>> =>  {
        cy.get(selector).should('be.visible');
        const peak = cy.$$(selector).length;
        const inx = Math.floor(Math.random() * peak);
        return cy.get(`${selector}:eq(${inx})`);
    };

    const randomArrayValue = <T>(arr: Array<T>): T => {
        return  arr[Math.floor(Math.random() * arr.length)];
    };

    /*const randomRoomTitle = (arr: Array<string>): string => {
        let titleRoom = randomArrayValue<string>(arr);
        // it appears that title cannot be shown larger than 15 chars, 4 are for the random chars
        if (titleRoom.length > (15 - 4)) titleRoom = titleRoom.substring(0, 11);
        titleRoom += '_' + Math.floor(Math.random()*100);
        while (arr.includes(titleRoom)) {
            titleRoom += '_' + Math.floor(Math.random()*100);
            // obey to the max chars
            titleRoom = titleRoom.substring(0, 15);
        }
        return titleRoom;
    };*/

    const logout = () => {
        // the concret div.icon-button-container seems to properly trigger click event
        cy.get('app-nav app-icon-button div.icon-button-container').click({force: true});
        cy.get('app-root mat-dialog-container > app-settings div.sign-out', {timeout}).click({force: true});
    };

    const chooseDemoSchool = (name: 'Cypress Testing School 1' | 'Cypress Testing School 2' = 'Cypress Testing School 1') => {
        cy.get('app-school-toggle-bar div.selected-school').click();
        cy.get('app-dropdown').should('be.visible');
        cy.get('app-dropdown div.option-data').should('have.length.at.least', 2);
        cy.get('app-dropdown').contains(name).parent().parent().click();
    };

    before(() =>  {
        // @ts-ignore
        cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
        // login();
        chooseDemoSchool();
        getNavAction('Rooms').click();
    });

    after(() => {
        logout();
    });

    describe('Rooms', () => {
        it('should change to the demo school', () => {
            // move to "Cypress Testing School 1"
            chooseDemoSchool();
        });

        // if this test succeeded we can subsequently access needed UI elements to perform the room related actions
        // has a testing value?
        it.skip('should have the expected UI elements and overlay', () => {
            // move to "Cypress Testing School 1"
            chooseDemoSchool();
            getNavAction('Rooms').click();
            getRoomAction('Add').click();
            getConsentAction('New Room').click();
            cy.get('mat-dialog-container > app-overlay-container').should('be.visible');
            cy.contains('mat-dialog-container > app-overlay-container > form app-gradient-button', 'Save');
        });

        // testing value?
        it.skip('should the overlay being clicked the Room Add disappears', () => {
            closeModal();
            cy.get('mat-dialog-container > app-overlay-container > form').should('not.exist');
        });

        describe.skip('opening Room Add dialog', () => {
            let styColor: string;
            let styIcon: string;

            before(() => {
                openAddRoomDialog();
                cy.get('div.color-title').invoke('attr', 'style').then((sty) => styColor = sty);
                cy.get('div.icon-title').invoke('attr', 'style').then((sty) => styIcon = sty);
            });

            after(() => {
                closeModal();
            });

            // may not be of real value
            it.skip('should be free of error clues', () => {
                cy.get('label.clserrorLabel').should('not.exist');
                const styErrColor = cy.$$('div.color-title').attr('style');
                const styErrIcon = cy.$$('div.icon-title').attr('style');
                cy.log(styColor, styErrColor);
                expect(styColor).eq(styErrColor);
                expect(styIcon).eq(styErrIcon);
            });

            // may not be of real value
            it.skip('if saving without data then alerts appear', () => {
                // trigger error visual clues as Room Add dialog has not been populated cu data
                cy.get('mat-dialog-container > app-overlay-container > form app-gradient-button').contains('Save').click();
                cy.get('label.clserrorLabel').should('exist');
                cy.get('div.color-title').invoke('attr', 'style').should('not.eq', styColor);
                cy.get('div.icon-title').invoke('attr', 'style').should('not.eq', styIcon);
            });
        });

        describe('Create and delete a room', function() {
            let roomsNum: number;
            let pinnables: JQuery<HTMLElement>;
            let pinnablesTitles: string[];

            before(() => {
                openAddRoomDialog();

                cy.get('app-pinnable-collection app-pinnable').should('exist');
                pinnables = cy.$$('app-pinnable-collection app-pinnable');
                // number of rooms displayed as pinnables
                roomsNum = pinnables.length;
                // titles of existent rooms
                pinnablesTitles = pinnables.map((_, el) => el.textContent.trim()).get();
            });

            // no need here for closeModal - the action itself closes the backdrop
            it('should create/add a room', function() {
                // order must mimic order of input elements as they appear in html
                const mockRoom = [ROOM_TITLE, ROOM_NUM, ROOM_TIME];
                cy.get('app-room form app-input').should('have.length', 3).each(($el, i) => {
                  cy.wrap($el).type(mockRoom[i]);
                });
                // get a random color from color picker
                randomIndexElement('app-color-pallet-picker app-color').click();
                // choose a travel type
                const peak = 3;
                cy.get('app-restriction-picker span').should('have.length', peak).then($elems => {
                    const inx = TRAVEL_TYPE_INDEX;
                    cy.wrap($elems.get(inx)).click();
                });

                // advanced options
                // restrictions
                cy.get('app-advanced-options app-toggle-input').should('have.length', 3).each(($el, i) => {
                    cy.wrap($el).click();// check each
                    if (i === 2) { // 2nth  option  will open an input
                        cy.get('app-advanced-options app-input').type(PASSES_LIMIT);
                    }
                });

                // pretend to add a teacher
                // little value
                /*cy.get('app-room form app-sp-search')
                    .within(() => {
                        cy.get('app-gradient-button').click();
                        cy.get('app-round-input').type('t');
                        cy.get('div.options-wrapper div.option-list_item').should('be.visible');
                    });
<<<<<<< HEAD
                */
                //
                // choose a svg icon
                // no svg icons are loaded at this point, only an empty visual shell
                // when not testing, after you filled the title room input it triggers the load of a suggestion svg list
                // so we have to trigger the svgs loading typing 'room'
                // but before intercept request on 'https://smartpass.app/api/icons/search?query=room' and wait for it
                const keyword = 'room'; // it is expected to returns icons
                cy.intercept('GET', 'https://smartpass.app/api/icons/search?query=' + keyword).as('searchIconsByRoom');
                cy.intercept({
                  method: 'POST',
                  url: 'api/prod-us-central/v1/pinnables'
                }).as('newRoomRequest');
                // the request will be made here

                cy.get('app-icon-picker app-round-input').type(keyword, {delay: 0});
                // and try to avoid the isConnected = false waiting for the last of element as indicated by server
                cy.wait('@searchIconsByRoom', {responseTimeout: 50000})
                    .then(({response}) => {
                        cy.wrap(response.body.length);
                    })
                    .then((len) => {
                        cy.log(`got ${len} icons`);
                        // TODO pick one of them
                        cy.get('app-icon-picker div.icon-collection div.icon-container').should('have.length', len)
                            .first().should('be.visible').then(element => {
                              expect(Cypress.dom.isDetached(element)).to.be.false;
                              element.click();
                            });
                    });
                    // click on save
                    cy.get('mat-dialog-container > app-overlay-container > form app-gradient-button div.button').contains('Save').click();
                    cy.wait('@newRoomRequest');
                    // get the toaster element instead of wait
                    cy.contains('app-custom-toast', 'New room added').should('exist');
            });

            it('should lists newly added room in the rooms list', function() {
                // wait here for our expected last  pinnable
                // check if a new pinnable has added
                // roomNum is the former number of rooms
                cy.get('app-pinnable').contains(ROOM_TITLE)
                  .should('exist')
                  .should('have.length', 1)
                  .should('be.visible');
            });

            it('should list of rooms in the "From Where" and “To Where?” match our expanded list', function() {

                // assumed that ROOM_TITLE has been successfuly added
                const roomTitles = [ROOM_TITLE];

                cy.get('div.pinnable-card div.title').each(el => {
                  roomTitles.push(el.text());
                });

                // const roomlistTitlesAdmin = roomTitles.sort();
                // const numberOfRooms = roomlistTitlesAdmin.length;
                // let roomlistTitles: string[];

                // const expectEqualRoomList = ($elems: JQuery<HTMLElement>) => {
                //     roomlistTitles = $elems.map((_, el: HTMLElement) => el.textContent.trim()).get().sort();
                //     expect(roomlistTitles).to.eql(roomlistTitlesAdmin);
                // };

                logout();
                // @ts-ignore
                cy.login(Cypress.env('student1Username'), Cypress.env('student1Password'));
                chooseDemoSchool();

                cy.log('testing Pass Now type');
                PassFunctions.openCreatePassDialog('now');

                // wait for the UI Pass Dialog to appears
                const fromcells = 'app-create-hallpass-forms app-main-hallpass-form app-from-where app-location-table app-location-cell div.title';
                // cy.get(fromcells).should('have.length', numberOfRooms).then(($ee) => expectEqualRoomList($ee));

                randomIndexElement(fromcells).click({force: true});
                const tocells = 'app-create-hallpass-forms app-main-hallpass-form app-to-where app-pinnable div.title';
                // cy.get(tocells).should('have.length', numberOfRooms).then(($ee) => expectEqualRoomList($ee));
                closeModal();
                cy.get(tocells).should('not.exist');

                cy.log('testing Pass Future type');
                PassFunctions.openCreatePassDialog('future');
                cy.get('app-create-hallpass-forms app-main-hallpass-form app-date-time app-gradient-button').should('be.visible').click();
                // cy.get(fromcells).should('have.length', numberOfRooms).then(($ee) => expectEqualRoomList($ee));
                randomIndexElement(fromcells).click({force: true});
                // cy.get(tocells).should('have.length', numberOfRooms).then(($ee) => expectEqualRoomList($ee));
                closeModal();

                cy.logoutStudent();
            });

            describe('pass student view reflect room modifications', function() {
                before(function() {
                    // @ts-ignore
                    cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
                    chooseDemoSchool();
                    getNavAction('Rooms').click();

                    // modify title
                    cy.get('app-pinnable-collection app-pinnable').should('be.visible').then((pinns) => {
                        cy.log(`proposed modified title "${MODIFIED_TITLE}"`);
                    });

                });


                it('should modify test room', function() {
                    cy.contains('app-pinnable-collection app-pinnable div.title', ROOM_TITLE).click();
                    cy.get('app-room form app-input').should('have.length', 3);
                    // title
                    cy.get('app-room form app-input:eq(0)').should('be.visible').type('{selectall}{del}' + MODIFIED_TITLE + '{enter}');
                    cy.get('app-room form app-input:eq(1)').should('be.visible').type('{selectall}{del}' + MODIFIED_ROOM_NUM + '{enter}');
                    cy.get('app-room form app-input:eq(2)').should('be.visible').type('{selectall}{del}' + MODIFIED_ROOM_TIME + '{enter}');
                    // TODO create a function
                    const peak = 3;
                    cy.get('app-restriction-picker span').should('have.length', peak).then($elems => {
                        const inx = MODIFIED_TRAVEL_TYPE_INDEX;
                        cy.wrap($elems.get(inx)).click();
                    });
                    cy.intercept({
                      method: 'PATCH',
                      url: /api\/prod-us-central\/v1\/pinnables\/\d+$/
                    }).as('updateRoomRequest');
                    cy
                      .get('app-overlay-container > form app-gradient-button div.button div.text-content').should('have.length', 3)
                      .contains('Save')
                      .click();
                    // it takes time to update the dom with titlemodified so the use of timeout
                    cy.wait('@updateRoomRequest');
                    cy.contains('app-custom-toast', 'Room updated').should('exist');
                    // https://smartpass.app/api/prod-us-central/v1/pinnables/12421
                    cy.log(`room should have title "${MODIFIED_TITLE}"`);
                    cy.contains('app-pinnable-collection app-pinnable div.title', MODIFIED_TITLE, {timeout})
                        .then(() => cy.log(`room has title modified "${MODIFIED_TITLE}"`));
                    closeModal();

                    logout();
                });

                it('should view the modified test room in the Pass Now / Future student view', { retries: 3 }, function() {
                        cy.log('logging as student');
                        // @ts-ignore
                        cy.login(Cypress.env('student1Username'), Cypress.env('student1Password'));
                        chooseDemoSchool();
                        cy.log('testing Pass Now type');
                        PassFunctions.openCreatePassDialog('now');

                        // wait for the UI Pass Dialog to appears
                        const fromcellsTitle = 'app-from-where app-location-cell div.title';
                        const fromcellsRoom = 'app-from-where app-location-cell div.room';
                        cy.log(`now from: testing "${MODIFIED_TITLE}"`);
                        cy.contains(fromcellsTitle, MODIFIED_TITLE).should('have.length', 1).should('be.visible');
                        cy.contains(fromcellsRoom, MODIFIED_ROOM_NUM).should('have.length', 1).should('be.visible');
                        cy.get('app-location-cell div.info').contains(MODIFIED_TITLE).click({force: true});
                        cy.contains(fromcellsTitle).should('not.exist');

                        const tocells = 'app-to-where app-pinnable';
                        cy.contains(tocells, MODIFIED_TITLE).should('not.exist');
                        closeModal();

                        cy.log('testing Pass Future type');
                        PassFunctions.openCreatePassDialog('future');
                        cy
                          .get('app-create-hallpass-forms app-main-hallpass-form app-date-time app-gradient-button').should('be.visible')
                          .click();
                        cy.contains(fromcellsTitle, MODIFIED_TITLE).should('have.length', 1).should('be.visible');
                        cy.contains(fromcellsRoom, MODIFIED_ROOM_NUM).should('have.length', 1).should('be.visible');
                        cy.get('app-location-cell div.info').contains(MODIFIED_TITLE).click({force: true});
                        cy.log(`future from testing "${MODIFIED_TITLE}"`);
                        cy.contains(fromcellsTitle, MODIFIED_TITLE).should('have.length', 1).click({force: true});
                        cy.contains(fromcellsTitle).should('not.exist');
                        closeModal();

                        // cy.log(`future to testing "${MODIFIED_TITLE}"`);
                        // cy.wait(1000);
                        // cy.get('div.isSameRoom div.pinnable-card').contains(MODIFIED_TITLE).should('have.length', 1);

                        // cy.get(tocells).should('not.exist');

                        cy.logoutStudent();
                });

                it.skip('should the modified test room reflects changes of title, duration, travel type on the Send Request Card', function() {
                        const DEMO_TEACHER = 'Demo Teacher1';
                        const openCardRequestThanTest = () => {
                            cy.get('app-sp-search input').should('have.length', 1).should('be.visible').type(DEMO_TEACHER);
                            cy.get('app-sp-search div.options-wrapper').contains(DEMO_TEACHER).should('exist').should('be.visible').click();
                            cy.get('app-create-hallpass-forms app-main-hallpass-form div.text-content').contains('Skip').click();
                            cy.get('app-request-card div.pass-card-header div.pass-card-header-text').contains(MODIFIED_TITLE);
                            cy.get('app-request-card')
                                .within(() => {
                                    cy.get('app-traveltype-picker div.option').contains(MODIFIED_TRAVEL_TYPE);
                                    cy.get('app-duration-picker div.large').contains(MODIFIED_ROOM_TIME);
                                });
                            closeModal();
                        };

                        cy.log('logging as student');
                        // @ts-ignore
                        cy.login(Cypress.env('student1Username'), Cypress.env('student1Password'));
                        chooseDemoSchool();
                        cy.log('testing Pass Now type');
                        PassFunctions.openCreatePassDialog('now');

                        // wait for the UI Pass Dialog to appears
                        const fromcellsTitle = 'app-from-where app-location-cell div.title';
                        const fromcellsRoom = 'app-from-where app-location-cell div.room';
                        cy.log(`now from: testing "${MODIFIED_TITLE}"`);
                        cy.contains(fromcellsTitle, MODIFIED_TITLE).should('have.length', 1).should('be.visible');
                        cy.contains(fromcellsRoom, MODIFIED_ROOM_NUM).should('have.length', 1).should('be.visible');
                        // choose from default rooms
                        // random name from defaultRoomNames?
                        const ANY_ROOM_THAN_MODIFIED = 'Bathroom';
                        cy.get('app-location-cell div.info').contains(ANY_ROOM_THAN_MODIFIED).click({force: true});
                        cy.contains(fromcellsTitle).should('not.exist');

                        const tocells = 'app-to-where app-pinnable';
                        cy.contains(tocells, MODIFIED_TITLE).should('have.length', 1).should('be.visible').click();
                        openCardRequestThanTest();

                        cy.log('testing Pass Future type');
                        PassFunctions.openCreatePassDialog('future');
                        cy
                          .get('app-create-hallpass-forms app-main-hallpass-form app-date-time app-gradient-button').should('be.visible')
                          .click();
                        cy.contains(fromcellsTitle, MODIFIED_TITLE).should('have.length', 1).should('be.visible');
                        cy.contains(fromcellsRoom, MODIFIED_ROOM_NUM).should('have.length', 1).should('be.visible');

                        cy.get('app-location-cell div.info').contains(ANY_ROOM_THAN_MODIFIED).click({force: true});
                        cy.contains(fromcellsTitle).should('not.exist');

                        cy.get('app-location-cell div.info').contains(MODIFIED_TITLE).click({force: true});
                        cy.log(`future from testing "${MODIFIED_TITLE}"`);
                        cy.contains(fromcellsTitle, MODIFIED_TITLE).should('have.length', 1).click({force: true});
                        cy.contains(fromcellsTitle).should('not.exist');
                        closeModal();

                        // cy.log(`future to testing "${MODIFIED_TITLE}"`);
                        // cy.contains(tocells, MODIFIED_TITLE).should('have.length', 1).should('be.visible').click();
                        // openCardRequestThanTest();
                        // cy.get(tocells).should('not.exist');

                        cy.logoutStudent();
                });

                // no need here for closeModal - the action itself closes the backdrop
                it('should delete last added room', function() {
                        // @ts-ignore
                        cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
                        chooseDemoSchool();
                        getNavAction('Rooms').click();

                        cy.get('app-pinnable div.title-bar > div.title').each(element => {
                          const roomTitle = element.text();
                          if (!defaultRoomNames.includes(roomTitle)) {
                            element.parent().parent().parent().trigger('click');
                            cy.get('mat-dialog-container > app-overlay-container app-room app-gradient-button').contains('Delete room').click({force: true});
                            cy.intercept({
                              method: 'DELETE',
                              url: /api\/prod-us-central\/v1\/pinnables\/\d+$/
                            }).as('deleteRoomRequest');
                            cy.get('mat-dialog-container > app-consent-menu').contains('Confirm Delete').click();
                            cy.wait('@deleteRoomRequest');
                            cy.get('app-custom-toast', {timeout}).contains('Room deleted').should('exist');
                          }
                        });

                        // cy.get('app-pinnable-collection app-pinnable', {timeout}).contains(MODIFIED_TITLE).click();
                        // cy.get('mat-dialog-container > app-overlay-container app-room app-gradient-button').contains('Delete room').click();
                        // cy.get('mat-dialog-container > app-consent-menu').contains('Confirm Delete').click();
                        // cy.get('app-pinnable-collection app-pinnable').should('have.length', this.roomsNum);
                        // cy.get('app-custom-toast', {timeout}).contains('Room deleted').should('exist');
                          // .then(() => this.roomsNum -= 1);
                });

            });

        });
    });

});
