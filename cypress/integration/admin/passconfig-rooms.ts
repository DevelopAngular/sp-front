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
        const peak = cy.$$(selector).length;
        const inx = Math.floor(Math.random() * peak);
        return cy.get(`${selector}:eq(${inx})`);
    }

    const randomArrayValue = <T>(arr: Array<T>): T => {
        return  arr[Math.floor(Math.random() * arr.length)];
    }

    describe("Rooms", () => {

        before(() => {
            // @ts-ignore
            cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
        });
    
        it('should have the expected UI', () => {
            getNavAction('Rooms').should('exist').click({force: true});
            getRoomAction('Add').should('exist').click({force: true});
            getConsentAction('New Room').should('exist').click({force: true});
            cy.get('mat-dialog-container > app-overlay-container > form')
                .should('exist')
                .within(() => cy.get('app-gradient-button').contains('Save').should('exist'));
        });
        
        it('should create/add a room', () => {
            // order must mimic order of input elements as they appear in html
            const mockRoom = ['Cy test', '42', '10'];

            const pinnables = cy.$$('app-pinnable-collection app-pinnable');
            // number of rooms displayed as pinnables
            const roomsNum = pinnables.length;
            // titles of existent rooms
            const pinnablesTitles = pinnables.map((_, el) => el.textContent.trim()).get();
            let titleRoom = randomArrayValue<string>(pinnablesTitles);
            console.log(pinnablesTitles, roomsNum);
            cy.get('app-room form').should('exist')
            cy.get('app-room form app-input').each(($el, i) => {
                if (i >= mockRoom.length) throw new Error('unexpected number of inputs[type=text]');
                // ensure title room is unique
                if (i === 0) {
                    titleRoom += '_' + Math.floor(Math.random()*100);
                    while (pinnablesTitles.includes(titleRoom)) {
                        titleRoom += '_' + Math.floor(Math.random()*100);
                    }
                    cy.wrap($el).type(titleRoom, {delay: 20});
                    return;
                }
                cy.wrap($el).type(mockRoom[i], {delay: 20});
            });
            // get a random color from color picker
            randomIndexElement('app-color-pallet-picker app-color').click();
            // choose a travel type
            const peak = 3;
            cy.get('app-restriction-picker span').should('have.length', peak);
            const inx = Math.floor(Math.random() * peak);
            cy.get(`app-restriction-picker span:eq(${inx})`).click();
            // choose a svg icon
            // no svg icons are loaded at this point, only an empty visual shell
            // when not testing, after you filled the title room input it triggers the load of a suggestion svg list
            // so we have to trigger the svgs loading typing 'room'
            cy.get('app-icon-picker app-round-input').type('room');
            cy.wait(2000);
            randomIndexElement('app-icon-picker div.icon-wrapper').click();
            // click on save
            cy.get('mat-dialog-container > app-overlay-container > form app-gradient-button').contains('Save').should('exist').click();
            //cy.get('app-input input[class~=ng-invalid]').should('not.exist');
            // get the toaster element instead of wait
            cy.get('app-custom-toast', {timeout}).contains('New room added').should('exist');
            // wait here for our expected last  pinnable
            cy.wait(2000);
            // check if a new pinnable has added
            cy.get('app-pinnable-collection app-pinnable').should('have.length', roomsNum+1);
            const lastPinnable = cy.get('app-pinnable-collection app-pinnable', {timeout}).last().contains(titleRoom).should('exist');
            lastPinnable.click();
            cy.get('mat-dialog-container > app-overlay-container app-room')
                .should('exist')
                .within(() => {
                    cy.get('app-gradient-button').contains('Delete room').should('exist').click();
                });
            cy.get('mat-dialog-container > app-consent-menu').contains('Confirm Delete').click();
            cy.get('app-pinnable-collection app-pinnable').should('have.length', roomsNum);
        })
    }); 

});
