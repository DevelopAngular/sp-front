import { BaseModel } from './base';

export class School extends BaseModel {
    constructor(public id: string, public  name: string, public my_roles: string[]) {
        super();
    }

    static fromJSON(JSON: any): School {
        if (!JSON) {
          return null;
        }

        // console.log(JSON);
        const id: string = '' +JSON['id'],
            name: string = '' +JSON['name'],
        my_roles: string[] = JSON['my_roles'];

        return new School(id, name, my_roles);
    }
}
