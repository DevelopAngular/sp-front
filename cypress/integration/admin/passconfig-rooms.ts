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
            // number of rooms displayed as pinnables
            const roomsNum = cy.$$('app-pinnable-collection app-pinnable').length;
            cy.get('app-room form').should('exist')
            cy.get('app-room form').find('input[type=text]').each(($el, i) => {
                if (i >= mockRoom.length) throw new Error('unexpected number of inputs[type=text]');
                cy.wrap($el).focus().type(mockRoom[i], {delay: 20});
            });
            // get a random color from color picker
            randomIndexElement('app-color-pallet-picker app-color').click();
            // choose a travel type
            const peak = 3;
            cy.get('app-restriction-picker span').should('have.length', peak);
            const inx = Math.floor(Math.random() * peak);
            cy.get(`app-restriction-picker span:eq(${inx})`).click();
            // choose a svg icon
            randomIndexElement('app-icon-picker div.icon-wrapper').click();
            // click on save
            cy.get('mat-dialog-container > app-overlay-container > form app-gradient-button').contains('Save').should('exist').click();
            //cy.get('app-input input[class~=ng-invalid]').should('not.exist');
            // get the toaster element instead of wait
            cy.get('app-custom-toast', {timeout}).contains('New room added').should('exist');
            const title = mockRoom[0];
            // wait here for our expected last  pinnable
            cy.wait(1000);
            const lastPinnable = cy.get('app-pinnable-collection app-pinnable', {timeout}).last().contains(title).should('exist');
            // check if a new pinnable has added
            const currentRoomsNum = cy.$$('app-pinnable-collection app-pinnable').length;
            if (roomsNum !== currentRoomsNum) throw new Error('pinnable collection has not increased in number');
            lastPinnable.click();
            cy.get('mat-dialog-container > app-overlay-container app-room')
                .should('exist')
                .within(() => {
                    cy.get('app-gradient-button').contains('Delete room').should('exist').click();
                });
                cy.get('mat-dialog-container > app-consent-menu').contains('Confirm Delete').click();

        })
    }); 

});