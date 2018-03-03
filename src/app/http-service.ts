import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const baseURL:string = "https://notify-messenger-notify-server-staging.lavanote.com/";
@Injectable()
export class HttpService{
    constructor(private http: HttpClient){

    }
    
    get(url, config){
        let out;
        this.http.get(baseURL + url, config).subscribe((data) => {  
            out = data;
        });
        return out;
    }

    post(url:string, body, config){

    }
}
