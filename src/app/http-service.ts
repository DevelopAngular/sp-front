import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const baseURL:string = "https://notify-messenger-notify-server-staging.lavanote.com/";
@Injectable()
export class HttpService{
    constructor(private http: HttpClient){

    }
    
    get(url:string, body, config){

    }

    post(url:string, body, config){

    }
}
