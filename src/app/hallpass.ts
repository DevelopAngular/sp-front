export class HallPass {
    constructor(
        public to: string,
        public from: string,
        public duration: string,
        public auth: string,
        public description?: string
        ){
            
        }
}
