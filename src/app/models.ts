export class User{
    constructor(public id:string,
                public display_name:string,
                public created?:string,
                public last_updated?:string,
                public first_name?:string,
                public last_name?:string,
                public primary_email?:string,
                public roles?:string[]){}
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
    constructor(private id: string,
                private name: string,
                private to: Location,
                private from: Location,
                private duration: string,
                private timeOut: string,
                private description: string,
                private email: string[]){}
}

export class PendingPass {
    constructor(public students: User[],
                public description: string,
                public to_location: Location,
                public valid_time: string,
                public start_time: string,
                public from_location?: Location,
                public end_time?: string,
                public issuer?: User,
                public authorities?: User[]){}
}