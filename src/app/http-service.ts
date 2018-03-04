import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

const baseURL:string = "https://notify-messenger-notify-server-staging.lavanote.com/";
@Injectable()
export class HttpService{
    constructor(private http: HttpClient){

    }
    
    get<T>(url, config): Observable<T> {
        const response: Observable<any> = this.http.get(baseURL + url, config);
        return response;
    }

    post(url:string, body, config){
        if(body == "")
            return this.http.post(baseURL + url, config);
        else
            return this.http.post(baseURL + url, body, config);
    }
}