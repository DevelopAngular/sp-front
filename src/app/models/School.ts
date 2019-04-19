import { BaseModel } from './base';

export class School extends BaseModel {
    constructor(
        public display_card_room: boolean,
        public id: string,
        public  name: string,
        public my_roles: string[],
        public pass_buffer_time: number
    ) {
        super();
    }

    static fromJSON(JSON: any): School {
        if (!JSON) {
          return null;
        }

        // console.log(JSON);
        const id: string = '' +JSON['id'],
            display_card_room: boolean = JSON['display_card_room'],
            name: string = '' +JSON['name'],
        my_roles: string[] = JSON['my_roles'],
        pass_buffer_time: number = JSON['pass_buffer_time'];

        return new School(display_card_room, id, name, my_roles, pass_buffer_time);
    }
}
