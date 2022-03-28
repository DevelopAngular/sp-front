import { closeModal } from '../../support/functions/general';
import * as PassFunctions from '../../support/functions/passes';

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
        getRoomAction('Add').click();
        getConsentAction('New Room').click();
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

    interface generateRoomTitleParams {
        prefix?: string,
        len?: number,
        joinchar?: string,
        avoid?: string[],
    }
    const generateRoomTitle = ({prefix = 'Test', len = 15, joinchar = '-', avoid = ['']}: generateRoomTitleParams): string => {
        const arr = [0,1,2,3,4,5,6,7,8,9];
        const lenRandomPart = len - (prefix + joinchar).length;
        const lenMinRandomPart = 3;
        if (lenRandomPart < lenMinRandomPart) throw new Error(`the random part needs to be greather than ${lenMinRandomPart}`);
        let randomPart: string = '';
        while (randomPart.length < lenRandomPart) {
            randomPart += randomArrayValue<number>(arr);
        }
        let titleRoom = prefix + joinchar + randomPart;
        while (avoid.includes(titleRoom)) titleRoom = generateRoomTitle({prefix, len, joinchar, avoid});

        return titleRoom;
    };

    const login = (
        username: string = Cypress.env('adminUsername'), 
        password: string = Cypress.env('adminPassword'),
    ) => {
        cy.visit('');
        cy.get('google-signin app-input:eq(0)').type(username);
        cy.get('google-signin app-gradient-button').click();
        cy.get('google-signin app-input:eq(1)').type(password);
        cy.get('google-signin app-gradient-button').click();
    };

    const logout = () => {
        // the concret div.icon-button-container seems to properly trigger click event
        cy.get('app-nav app-icon-button div.icon-button-container').click({force: true});
        cy.get('app-root mat-dialog-container > app-settings div.sign-out', {timeout}).click({force: true});
    };

    const chooseDemoSchool = (name: 'Cypress Testing School 1' | 'Cypress Testing School 2' = 'Cypress Testing School 1') => {
        cy.get('app-school-toggle-bar div.selected-school').click();
        cy.contains('app-dropdown', name).should('be.visible')
            .find('div.option-wrapper').should('have.length', 2)
            .contains(name).click();
    };

    before(() => {
        login();
        chooseDemoSchool();
        getNavAction('Rooms').click();
        // @ts-ignore
        //cy.login(Cypress.env('adminUsername'), Cypress.env('adminPassword'));
    });

    after(()=> {
        logout();
    });

    describe("Rooms", () => {
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
                const titleRoom = generateRoomTitle({avoid: pinnablesTitles});
                cy.wrap(titleRoom).as('titleRoom');
                cy.wrap(roomsNum).as('roomsNum');
            });
            
            // no need here for closeModal - the action itself closes the backdrop
            it('should create/add a room', function() {
                // order must mimic order of input elements as they appear in html
                const mockRoom = ['Cy test', '41', '10'];
                cy.get('app-room form app-input').should('have.length', 3).each(($el, i) => {
                    i === 0 ?
                        cy.wrap($el).type(this.titleRoom, {delay: 0}):
                        cy.wrap($el).type(mockRoom[i], {delay: 0});
                });
                // get a random color from color picker
                randomIndexElement('app-color-pallet-picker app-color').click();
                // choose a travel type
                const peak = 3;
                //const inx = Math.floor(Math.random() * peak);
                // isConnected may be false at tims
                //cy.get(`app-restriction-picker span:eq(${inx})`).should('have.attr', 'isConnected', true).click();
                //cy.get(`app-restriction-picker span:eq(${inx})`).click();
                cy.get('app-restriction-picker span').should('have.length', peak).then($elems => {
                    const inx = Math.floor(Math.random() * peak);
                    cy.wrap($elems.get(inx)).click();
                });

                // advanced options
                cy.get('app-advanced-options app-toggle-input').should('have.length', 3).each(($el, i) => {
                    cy.wrap($el).click();
                    if (i == 2) {
                        cy.get('app-advanced-options app-input').type('10');
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
                */
                // choose a svg icon
                // no svg icons are loaded at this point, only an empty visual shell
                // when not testing, after you filled the title room input it triggers the load of a suggestion svg list
                // so we have to trigger the svgs loading typing 'room'
                // but before intercept request on 'https://smartpass.app/api/icons/search?query=room' and wait for it
                const keyword = 'room'; // it is expected to returns icons
                cy.intercept('GET', 'https://smartpass.app/api/icons/search?query=' + keyword).as('searchIconsByRoom');
                // the request will be made here
                cy.get('app-icon-picker app-round-input').type(keyword, {delay: 0});
                // allow server a healthy time
                // and try to avoid the isConnected = false waiting for the last of element as indicated by server 
                cy.wait('@searchIconsByRoom', {responseTimeout: 50000})
                    .then(({response}) => {
                        cy.wrap(response.body.length);
                    })
                    .then((len) => {
                        cy.log(`got ${len} icons`);
                        // TODO pick one of them
                        cy.get('app-icon-picker div.icon-collection div.icon-container').should('have.length', len)
                            .first().should('be.visible').click();
                    });
                    // click on save
                    cy.get('mat-dialog-container > app-overlay-container > form app-gradient-button div.button').contains('Save').click();
                    // get the toaster element instead of wait
                    cy.contains('app-custom-toast', 'New room added').should('exist');
            });

            it('should lists newly added room in the rooms list', function() {
                // wait here for our expected last  pinnable
                // check if a new pinnable has added
                // roomNum is the former number of rooms
                cy.log(`roomsNum ${this.roomsNum}`);
                cy.get('app-pinnable-collection app-pinnable').should('have.length',this.roomsNum+1)
                    .last().contains(this.titleRoom)
                    // increment when success
                    .then(() => {
                        this.roomsNum += 1;
                        pinnablesTitles.push(this.titleRoom);
                        cy.log(`room "${this.titleRoom}" has been added in rooms list`);    
                    });
            });

            it('should list of rooms in the "From Where" and “To Where?” match our expanded list', function() {
                
                cy.log(`roomNum ${this.roomsNum}`);
                const roomlistTitlesAdmin = pinnablesTitles.sort();
                let roomlistTitles: string[];
                
                const expectEqualRoomList = ($elems: JQuery<HTMLElement>) => {
                    roomlistTitles = $elems.map((_, el:HTMLElement) => el.textContent.trim()).get().sort();
                    expect(roomlistTitles).to.eql(roomlistTitlesAdmin);
                };

                logout();
                login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));

                cy.log('testing Pass Now type');
                PassFunctions.openCreatePassDialog('now');
              
                // wait for the UI Pass Dialog to appears
                const fromcells = 'app-create-hallpass-forms app-main-hallpass-form app-from-where app-location-table app-location-cell div.title';
                cy.get(fromcells).should('have.length', this.roomsNum).then(($ee) => expectEqualRoomList($ee));
              
                randomIndexElement(fromcells).click({force: true});
                const tocells = 'app-create-hallpass-forms app-main-hallpass-form app-to-where app-pinnable div.title';
                cy.get(tocells).should('have.length', this.roomsNum).then(($ee) => expectEqualRoomList($ee));
                closeModal();
                cy.get(tocells).should('not.exist');

                cy.log('testing Pass Future type');
                PassFunctions.openCreatePassDialog('future');
                cy.get('app-create-hallpass-forms app-main-hallpass-form app-date-time app-gradient-button').should('be.visible').click();
                cy.get(fromcells).should('have.length', this.roomsNum).then(($ee) => expectEqualRoomList($ee));
                randomIndexElement(fromcells).click({force: true});
                cy.get(tocells).should('have.length', this.roomsNum).then(($ee) => expectEqualRoomList($ee));
                closeModal();
                cy.get(tocells).should('not.exist');

                // @ts-ignore
                cy.logout();
            });
            
            describe('pass student view reflect room modifications', function() {
                before(function() {
                    login();
                    chooseDemoSchool();
                    getNavAction('Rooms').click();

                    // modify title
                    cy.get('app-pinnable-collection app-pinnable').should('be.visible').then((pinns) => {
                        const currtitles = pinns.map((_, el) => el.textContent.trim()).get();
                        const titleRoomModified = generateRoomTitle({prefix: 'ALTERED', avoid: currtitles});
                        cy.log(`proposed modified title "${titleRoomModified}"`);
                        cy.wrap(titleRoomModified).as('titlemodified');
                    });

                });


                it('should modify test room', function() {
                    cy.contains('app-pinnable-collection app-pinnable div.title', this.titleRoom).click();
                    cy.get('app-room form app-input').should('have.length', 3);
                    // title
                    cy.get('app-room form app-input:eq(0)').should('be.visible').type('{selectall}{del}' + this.titlemodified + '{enter}');
                    cy.get('app-overlay-container > form app-gradient-button div.button div.text-content').should('have.length', 3).contains('Save').click();
                    //cy.contains('app-custom-toast', 'Room updated').should('exist');
                    cy.get('app-overlay-container > form', {timeout}).should('not.exist');
                    // it takes time to update the dom with titlemodified so the use of timeout
                    // https://smartpass.app/api/prod-us-central/v1/pinnables/12421
                    cy.log(`room should have title "${this.titlemodified}"`);
                    cy.contains('app-pinnable-collection app-pinnable div.title', this.titlemodified, {timeout})
                        .then(() => cy.log(`room has title modified "${this.titlemodified}"`));
                    
                    logout();
                });

                it('should editing the added room be reflected in the Pass Now student view', { retries: 3 }, function() {
                        cy.log('logging as student');
                        login(Cypress.env('studentUsername'), Cypress.env('studentPassword'));
                        PassFunctions.openCreatePassDialog('now');
                        cy.log('testing Pass Now type');
                        PassFunctions.openCreatePassDialog('now');
                        
                        // wait for the UI Pass Dialog to appears
                        const fromcells = 'app-from-where app-location-cell div.title';
                        cy.log(`now from: testing "${this.titlemodified}"`);
                        cy.contains(fromcells, this.titlemodified).should('have.length', 1).should('be.visible').click();
                        //TODO just to draw attention
                        //here this.titlemodified exists in UI Pass Now From side
                        // and it is expected toexists in the PassNow To side
                        // instead there exists the unmodified title
                        // so, we have the  modified title in Pass Now From but old title in Pass Now To   
                        cy.contains(fromcells).should('not.exist');
                        //randomIndexElement(fromcells).click();

                        // when the Pass To is a list like Pass From 
                        //const tocells = 'app-to-where app-location-cell';
                        const tocells = 'app-to-where app-pinnable';
                        cy.log(`now to: testing "${this.titlemodified}"`);
                        //cy.contains(tocells, this.titlemodified).should('have.length', 1);
                        cy.get(tocells).should('have.length', this.roomsNum)
                        //TODO here it is a stop for you to see in the Cypress browser
                            //.pause()
                            .contains(this.titlemodified); // TODO it is not found
                            //.contains(this.titleRoom);
                        closeModal();
                        cy.get(tocells).should('not.exist');

                        cy.log('testing Pass Future type');
                        PassFunctions.openCreatePassDialog('future');
                        cy.get('app-create-hallpass-forms app-main-hallpass-form app-date-time app-gradient-button').should('be.visible').click();
                        cy.log(`future from testing "${this.titlemodified}"`);
                        cy.contains(fromcells, this.titlemodified).should('have.length', 1).click({force: true});
                        //randomIndexElement(fromcells).click({force: true});
                        cy.contains(fromcells).should('not.exist');

                        cy.log(`future to testing "${this.titlemodified}"`);
                        cy.contains(tocells, this.titlemodified).should('have.length', 1);
                        cy.get(tocells).should('have.length', this.roomsNum)
                            .contains(this.titlemodified);
                            // TODO same for Pass Future
                            //.contains(this.titleRoom);
                        closeModal();
                        cy.get(tocells).should('not.exist');
                       
                        // @ts-ignore
                        cy.logout();
                });

                // no need here for closeModal - the action itself closes the backdrop
                it('should delete last added room', function() {
                        login();
                        chooseDemoSchool();
                        getNavAction('Rooms').click();

                        cy.get('app-pinnable-collection app-pinnable:last', {timeout}).contains(this.titlemodified).click();
                        cy.get('mat-dialog-container > app-overlay-container app-room app-gradient-button').contains('Delete room').click();
                        cy.get('mat-dialog-container > app-consent-menu').contains('Confirm Delete').click();
                        cy.get('app-pinnable-collection app-pinnable').should('have.length', this.roomsNum);
                        cy.get('app-custom-toast', {timeout}).contains('Room deleted').should('exist').then(() => this.roomsNum -= 1);
                });

            });

        });
    }); 

});
