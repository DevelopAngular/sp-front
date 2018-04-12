import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../environments/environment';
import { DataService } from './data-service';

const baseURL = environment.serverConfig.host;

export interface Config {
  [key: string]: any;
}

type ConfigJSON = Config & {responseType: 'json'};
@Injectable()
export class HttpService {
  barer;
    constructor(private http: HttpClient, private dataService:DataService) {
    }

    get<T>(url, config: Config): Observable<T> {
        this.dataService.currentBarer.subscribe(barer => this.barer = barer);
        const newConfig: Config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
        config['responseType'] = 'json';
        return this.http.get<T>(baseURL + url, newConfig as ConfigJSON);
    }

    post(url: string, body?, config?: Config) {
      if (config) {
        this.dataService.currentBarer.subscribe(barer => this.barer = barer);
        const newConfig: Config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
        console.log('Sent post with config.');
        config['responseType'] = 'json';
        return this.http.post(baseURL + url, body, newConfig as ConfigJSON);
      } else {
        console.log('Sent post without config.');
        return this.http.post(baseURL + url, body);
      }
    }
}
