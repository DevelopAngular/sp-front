import { closeModal } from "../../support/functions/general";

describe('Admin - UI and Actions', () => {
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
        getRoomAction('Add').click({force: true});
        getConsentAction('New Room').click({force: true});
    }

    const randomIndexElement = (selector: string): Cypress.Chainable<JQuery<HTMLElement>> =>  {
        cy.get(selector).should('be.visible');
        const peak = cy.$$(selector).length;
        const inx = Math.floor(Math.random() * peak);
        return cy.get(`${selector}:eq(${inx})`);
    }

    const randomArrayValue = <T>(arr: Array<T>): T => {
        return  arr[Math.floor(Math.random() * arr.length)];
    }

    const randomRoomTitle = (arr: Array<string>): string => {
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
    };

    before(() => {
        // login
        cy.visit('');
        cy.get('google-signin app-input:eq(0)').type(Cypress.env('adminUsername'));
        cy.get('google-signin app-gradient-button').click();
        cy.get('google-signin app-input:eq(1)').type(Cypress.env('adminPassword'));
        cy.get('google-signin app-gradient-button').click();
        // @ts-ignore
        //cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
    });

    after(()=> {
        // logout
        // the concret div.icon-button-container seems to properly trigger click event
        cy.get('app-nav app-icon-button div.icon-button-container').should('exist').click({force: true});
        cy.get('app-root mat-dialog-container > app-settings div.sign-out', {timeout}).should('exist').click({force: true});
    });

    describe("Rooms", () => {
        // if this test succeeded we can subsequently access needed UI elements to perform the room related actions
        it('should have the expected UI elements and overlay', () => {

            getNavAction('Rooms').should('exist').click();
            getRoomAction('Add').should('exist').click();
            getConsentAction('New Room').should('exist').click();
            cy.get('mat-dialog-container > app-overlay-container')
            .should('exist').should('be.visible'); 
            cy.get('mat-dialog-container > app-overlay-container > form').should('exist')
                .within(() => cy.get('app-gradient-button').contains('Save').should('exist'));
        });

        it('should the overlay being clicked the Room Add disappears', () => {
            closeModal();
            cy.get('mat-dialog-container > app-overlay-container > form').should('not.exist');
        });
    
        describe('opening Room Add dialog', () => {
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

            it('should be free of error clues', () => {
                cy.get('label.clserrorLabel').should('not.exist');
                const styErrColor = cy.$$('div.color-title').attr('style');
                const styErrIcon = cy.$$('div.icon-title').attr('style');
                cy.log(styColor, styErrColor);
                expect(styColor).eq(styErrColor);
                expect(styIcon).eq(styErrIcon);
            });

            it('if saving without data then alerts appear', () => {
                // trigger error visual clues as Room Add dialog has not been populated cu data
                cy.get('mat-dialog-container > app-overlay-container > form app-gradient-button').contains('Save').click();
                cy.get('label.clserrorLabel').should('exist');
                cy.get('div.color-title').invoke('attr', 'style').should('not.eq', styColor);
                cy.get('div.icon-title').invoke('attr', 'style').should('not.eq', styIcon);
            });
        });
        
        describe('Create and delete a room', () => {
            let titleRoom: string;
            let roomsNum: number;
            let pinnables: JQuery<HTMLElement>;
            let pinnablesTitles: string[];
            
            before(() => {
                openAddRoomDialog();

                pinnables = cy.$$('app-pinnable-collection app-pinnable');
                // number of rooms displayed as pinnables
                roomsNum = pinnables.length;
                // titles of existent rooms
                pinnablesTitles = pinnables.map((_, el) => el.textContent.trim()).get();
                titleRoom = randomRoomTitle(pinnablesTitles);
            });
            
            // no need here for closeModal - the action itself closes the backdrop
            it('should create/add a room', () => {
                // order must mimic order of input elements as they appear in html
                const mockRoom = ['Cy test', '41', '10'];
                cy.get('app-room form').should('exist')
                cy.get('app-room form app-input').should('have.length', 3).each(($el, i) => {
                    if (i === 0) {
                        cy.wrap($el).type(titleRoom, {delay: 0});
                        return;
                    }
                    cy.wrap($el).type(mockRoom[i], {delay: 0});
                });
                // get a random color from color picker
                randomIndexElement('app-color-pallet-picker app-color').click();
                // choose a travel type
                const peak = 3;
                cy.get('app-restriction-picker span').should('have.length', peak);
                const inx = Math.floor(Math.random() * peak);
                cy.get(`app-restriction-picker span:eq(${inx})`).click();

                // advanced options
                cy.get('app-advanced-options app-toggle-input').should('have.length', 3).each(($el, i) => {
                    cy.wrap($el).click();
                    if (i == 2) {
                        cy.get('app-advanced-options app-input').should('exist').type('10');
                    }
                });

                // pretend to add a teacher
                cy.get('app-room form app-sp-search')
                    .within(() => {
                        cy.get('app-gradient-button').should('exist').click();
                        cy.get('app-round-input').should('exist').type('t');
                        cy.get('div.options-wrapper').should('be.visible').get('div.option-list_item').should('be.visible');
                    });
            /*
                // this seldomly works
                cy.get('app-advanced-options app-toggle-input').should('have.length', 3).and(($elems) => {
                    let $el = $elems.get(0);
                    Cypress.dom.wrap($el).click();
                    $el = $elems.get(1);
                    Cypress.dom.wrap($el).click();
                    $el = $elems.get(2);
                    Cypress.dom.wrap($el).click();
                    cy.wait(1000);
                    cy.get('app-advanced-options app-input').should('exist').type('10');
                });*/

                // choose a svg icon
                // no svg icons are loaded at this point, only an empty visual shell
                // when not testing, after you filled the title room input it triggers the load of a suggestion svg list
                // so we have to trigger the svgs loading typing 'room'
                // but before intercept request on 'https://smartpass.app/api/icons/search?query=room' and wait for it
                cy.intercept('GET', 'https://smartpass.app/api/icons/search?query=room').as('searchIconsByRoom');
                // the request will be made here
                cy.get('app-icon-picker app-round-input').type('room', {delay: 0});
                cy.wait('@searchIconsByRoom');
                randomIndexElement('app-icon-picker div.icon-wrapper').click();
                // click on save
                cy.get('mat-dialog-container > app-overlay-container > form app-gradient-button').contains('Save').should('exist').click();
                // get the toaster element instead of wait
                cy.get('app-custom-toast', {timeout}).contains('New room added').should('exist');
                // wait here for our expected last  pinnable
                // check if a new pinnable has added
                cy.get('app-pinnable-collection app-pinnable').should('have.length', roomsNum+1);
            });

            // no need here for closeModal - the action itself closes the backdrop
            it('should delete last added room', () => {
                const lastPinnable = cy.get('app-pinnable-collection app-pinnable', {timeout}).last().contains(titleRoom).should('exist');
                lastPinnable.click();
                cy.get('mat-dialog-container > app-overlay-container app-room')
                    .should('exist')
                    .within(() => {
                        cy.get('app-gradient-button').contains('Delete room').should('exist').click();
                    });
                cy.get('mat-dialog-container > app-consent-menu').contains('Confirm Delete').click();
                cy.get('app-pinnable-collection app-pinnable').should('have.length', roomsNum);
                cy.get('app-custom-toast', {timeout}).contains('Room deleted').should('exist');
            });

        });
    }); 

});