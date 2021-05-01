import {BaseModel} from './base';

export class School extends BaseModel {
    constructor(
        public display_card_room: boolean,
        public id: string,
        public name: string,
        public my_roles: string[],
        public pass_buffer_time: number,
        public earliest_pass_time: string,
        public gsuite_config: any,
        public gsuite_hosted_domain: string,
        public latest_pass_time: string,
        public address: any,
        public created: string,
        public display_username: boolean,
        public show_active_passes_number: boolean
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
            pass_buffer_time: number = JSON['pass_buffer_time'],
            earliest_pass_time: string = JSON['earliest_pass_time'],
            gsuite_config: any = JSON['gsuite_config'],
            gsuite_hosted_domain: string = JSON['gsuite_hosted_domain'],
            latest_pass_time: string = JSON['latest_pass_time'],
            address: any = JSON['address'],
            created: string = JSON['created'],
            display_username: boolean = JSON['display_username'],
            show_active_passes_number: boolean = JSON['show_active_passes_number'];

        return new School(
            display_card_room,
            id, name, my_roles,
            pass_buffer_time,
            earliest_pass_time,
            gsuite_config,
            gsuite_hosted_domain,
            latest_pass_time,
            address,
            created,
            display_username,
            show_active_passes_number
        );
    }
}
