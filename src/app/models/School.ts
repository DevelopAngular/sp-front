import { BaseModel } from './base';

export class School extends BaseModel {
    constructor(public id: string, public  name: string){
        super();
    }

    static fromJSON(JSON: any): School {
        if (!JSON) {
          return null;
        }
    
        // console.log(JSON);
        const id: string = '' +JSON['id'],
            name: string = '' +JSON['name'];

        return new School(id, name);
    }
}