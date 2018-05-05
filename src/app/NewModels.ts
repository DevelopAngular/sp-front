import {Injectable} from '@angular/core';

export class User {
    constructor(public id: string,
                public created: Date,
                public last_updated: Date,
                public first_name: string,
                public last_name: string,
                public display_name: string,
                public primary_email: string,
                public roles: string[]){}

    static fromJSON(JSON:any):User{
        const
        id: string = JSON['id'],
        created: Date = new Date(JSON['created']),
        last_updated: Date = new Date(JSON['last_updated']),
        first_name: string = JSON['first_name'],
        last_name: string = JSON['last_name'],
        display_name: string = JSON['display_name'],
        primary_email: string = JSON['primary_email'],
        roles: string[] = [];

        let rolesJSON = JSON['roles'];
        for(let i = 0; i < rolesJSON.length; i++){
            roles.push(rolesJSON[i]);
        }

        return new User(id, created, last_updated, first_name, last_name, display_name, primary_email, roles);
    }
}

export class Alert {
    constructor(public id: string,
                public created: Date,
                public last_updated: Date,
                public creator: User,
                public start_time: Date,
                public message: string,
                public users: User[],
                public high_priority: boolean,
                public status_sent: boolean){}

    static fromJSON(JSON:any):Alert{
        const id: string  = JSON['id'],
        created: Date = new Date(JSON['created']),
        last_created: Date = new Date(JSON['last_updated']),
        creator: User = User.fromJSON(JSON['creator']),
        start_time: Date = new Date(JSON['start']),
        message: string = JSON['message'],
        users: User[] = [],
        high_priority: boolean = JSON['high_priority'],
        status_sent: boolean = JSON['status'];

        let usersJSON = JSON['users'];
        for(let i = 0; i < usersJSON.length; i++){
            users.push(usersJSON[i]);
        }

        return new Alert(id, created, last_created, creator, start_time, message, users, high_priority, status_sent);
    }
}

export class HallPass {
    constructor(public id: string,
                public student: User,
                public issuer: User,
                public created_time: Date,
                public start_date: Date,
                public end_date: Date,
                public origin: Location,
                public destination: Location,
                public canceled: boolean){}

    static fromJSON(JSON:any):HallPass{
        const id: string = JSON['id'],
        student: User = User.fromJSON(JSON['student']),
        issuer: User = User.fromJSON(JSON['issuer']),
        created: Date = new Date(JSON['created']),
        start_date: Date = new Date(JSON['start_date']),
        end_date: Date = new Date(JSON['end_date']),
        origin: Location = Location.fromJSON(JSON['origin']),
        destination: Location = Location.fromJSON(JSON['destination']),
        canceled: boolean = JSON['canceled'] === "true";

        return new HallPass(id, student, issuer, created, start_date, end_date, origin, destination, canceled);
    }
}

export class Invitation {
    constructor(public id: string,
                public students: User[],
                public destiation: Location,
                public title: string,
                public date_choices: Date[],
                public issuer: User,
                public status: string){
    }

    static fromJSON(JSON:any){
        const id: string = JSON['id'],
        students: User[] = [],
        destination: Location = Location.fromJSON(JSON['destination']),
        title: string = JSON['title'],
        date_choices: Date[] = [],
        issuer: User = User.fromJSON(JSON['issuer']),
        status: string = JSON['status'];

        let studentsJSON = JSON['users'];
        for(let i = 0; i < studentsJSON.length; i++){
            students.push(studentsJSON[i]);
        }

        let datesJSON = JSON['date_choices'];
        for(let i = 0; i < datesJSON.length; i++){
            date_choices.push(new Date(datesJSON[i]));
        }

        return new Invitation(id, students, destination, title, date_choices, issuer, status);
    }
}

export class Location {
    constructor(public id: string,
                public title: string,
                public campus: string,
                public room: string,
                public catagory: string,
                public gradient_color: string,
                public icon: string,
                public restricted: boolean,
                public required_attatchments: string[],
                public travel_types: string[],
                public teachers: User[],
                public max_allowed_time: number,
                public invite_allowed: boolean){

    }

    static fromJSON(JSON:any):Location{
        const id: string = JSON['id'],
        title: string = JSON['title'],
        campus: string = JSON['campus'], 
        room: string = JSON['room'],
        catagory: string = JSON['catagory'],
        gradient_color: string = JSON['gradient_color'],
        icon: string = JSON['icon'],
        restricted: boolean = JSON['restricted']==="true",
        required_attachments: string[] = [],
        travel_types: string[] = [],
        teachers: User[] = [],
        max_allowed_time: number = parseInt(JSON['max_allowed_time']),
        invite_allowed: boolean = JSON['invite_allowed']==="true";

        let attachmentsJSON = JSON['required_attachments'];
        for(let i = 0; i < attachmentsJSON.length; i++){
            required_attachments.push(attachmentsJSON[i]);
        }

        let travelTypesJSON = JSON['travel_types'];
        for(let i = 0; i < travelTypesJSON.length; i++){
            travel_types.push(travelTypesJSON[i]);
        }

        let teachersJSON = JSON['teachers'];
        for(let i = 0; i < teachersJSON.length; i++){
            teachers.push(User.fromJSON(teachersJSON[i]));
        }

        return new Location(id, title, campus, room, catagory, gradient_color, icon, restricted, required_attachments, travel_types, teachers, max_allowed_time, invite_allowed);
    }
}

export class Pinnable {
    constructor(public id: string,
                public title: string,
                public gradient_color: string,
                public icon: string,
                public type: string,
                public location: Location,
                public catagory: string){
    }

    static fromJSON(JSON:any):Pinnable{
        const id: string = JSON['id'],
        title: string = JSON['title'],
        gradient_color: string = JSON['gradient_color'],
        icon: string = JSON['icon'],
        type: string = JSON['type'],
        location: Location = JSON['location'],
        catagory: string = JSON['catagory'];
        
        return new Pinnable(id, title, gradient_color, icon, type, location, catagory);
    }
}

export class Request {
    constructor(public id: string,
                public student: User,
                public destination: Location,
                public attachment_message: string,
                public travel_type: string,
                public status: string,
                public hallpass: HallPass){

    }

    static fromJSON(JSON:any):Request{
        const id: string = JSON['id'],
        student: User = User.fromJSON(JSON['student']),
        destination: Location = Location.fromJSON(JSON['destination']),
        attachment_message: string = JSON['attachment_message'],
        travel_type: string = JSON['travel_type'],
        status: string = JSON['status'],
        hallpass: HallPass = HallPass.fromJSON(JSON['hallpass']);

        return new Request(id, student, destination, attachment_message, travel_type, status, hallpass);
    }

}

export class Duration{
    constructor(public display: string,
                public value: number){
    }

    static fromJSON(JSON:any):Duration{
        const display:string = JSON/60+" minutes",
        value:number = JSON;
        return new Duration(display, value);
    }
  }