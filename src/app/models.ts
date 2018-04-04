import { Injectable } from '@angular/core';

export class User{
    constructor(public id:string,
                public display_name:string,
                public created?:Date,
                public last_updated?:Date,
                public first_name?:string,
                public last_name?:string,
                public primary_email?:string,
                public roles?:string[],
                public is_staff?:string){}
}

export class Location{
    constructor(public id: string,
                public name: string,
                public campus:string,
                public room: string,
                public teachers?: User[]){}
    get nameRoom(){
        return this.name +" (" +this.room +")";
    }
}

export class Pass{
    constructor(public created:Date,
                public last_updated:Date,
                public id:string,
                public issuer:User,
                public students:User[],
                public expiry_time:Date,
                public revoked:string,
                public description:string,
                public from_location:Location,
                public to_location:Location,
                public authorities:User[]){}
}

export class PendingPass {
    constructor(public students: User[],
                public description: string,
                public to_location: Location,
                public valid_time: string,
                public start_time: Date,
                public from_location?: Location,
                public end_time?: Date,
                public issuer?: User,
                public authorities?: User[],
                public created?: Date,
                public last_updated?: Date,
                public id?: string,
                public activated?:string[]){}
}
@Injectable()
export class JSONSerializer {
    constructor(){}
    getUserFromJSON(JSON):User{
        let id = JSON['id'],
        display_name = JSON['display_name'],
        created = new Date(JSON['created']),
        last_updated = JSON['last_updated'],
        first_name = JSON['first_name'],
        last_name = JSON['last_name'],
        primary_email = JSON['primary_email'],
        roles:any[] = [],
        is_staff = JSON['is_staff'];

        for(let i=0;i<JSON['roles'].length;i++){
            roles.push(JSON['roles'][i]);
        }

        return new User(id, display_name, created, last_updated, first_name, last_name, primary_email, roles, is_staff);
    }

    getLocationFromJSON(JSON):Location{
        if(!!JSON){
            let id = JSON['id'], 
            name = JSON['name'], 
            campus = JSON['campus'], 
            room = JSON['room'], 
            teachers:User[] = [];

            for(let i = 0; i<JSON['teachers'].legnth;i++){
                teachers.push(this.getUserFromJSON(JSON['teachers'][i]));
            }

            return new Location(id, name, campus, room, teachers);
        } else{
            return null;
        }
    }

    getPassFromJSON(JSON):Pass{
        let created = new Date(JSON['created']),
        last_updated = new Date(JSON['last_updated']),
        id = JSON['id'],
        issuer:User = this.getUserFromJSON(JSON['issuer']),
        students:User[] = [],
        expiry_time = new Date(JSON['expiry_time']),
        revoked = JSON['revoked'],
        description = JSON['description'],
        from_location:Location = this.getLocationFromJSON(JSON['from_location']),
        to_location: Location = this.getLocationFromJSON(JSON['to_location']),
        authorities:User[] = [];

        for(let i = 0; i < JSON['students'].length; i++){
            students.push(this.getUserFromJSON(JSON['students'][i]));
        }

        for(let i = 0; i < JSON['authorities'].length; i++){
            authorities.push(this.getUserFromJSON(JSON['authorities'][i]));
        }

        return new Pass(created, last_updated, id, issuer, students, expiry_time, revoked, description, from_location, to_location, authorities);
    }

    getPendingPassFromJSON(JSON):PendingPass{
        let students:User[] = [],
        description = JSON['description'],
        to_location:Location = this.getLocationFromJSON(JSON['to_location']),
        valid_time = JSON['valid_time'],
        start_time = new Date(JSON['start_time']),
        from_location:Location = this.getLocationFromJSON(JSON['from_location']),
        end_time = new Date(JSON['end_time']),
        issuer:User = this.getUserFromJSON(JSON['issuer']),
        authorities:User[] = [],
        created: Date = new Date(JSON['created']),
        last_updated: Date = new Date(JSON['last_updated']),
        id: string = JSON['id'],
        activated:string[] = [];

        for(let i = 0; i < JSON['students'].length; i++){
            students.push(this.getUserFromJSON(JSON['students'][i]));
        }

        for(let i = 0; i < JSON['authorities'].length; i++){
            authorities.push(this.getUserFromJSON(JSON['authorities'][i]));
        }

        if(!!JSON['activated']){
            for(let i = 0; i < JSON['activated'].length; i++){
                activated.push(JSON['activated'][i]);
            }
        }
        
        return new PendingPass(students, description, to_location, valid_time, start_time, from_location, end_time, issuer, authorities, created, last_updated, id, activated);
    }
}