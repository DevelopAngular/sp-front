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

    get<T>(url, config?: Config): Observable<T> {
      this.dataService.currentBarer.subscribe(barer => this.barer = barer);
      const newConfig = {headers: {'Authorization' : 'Bearer ' + this.barer}};
      return this.newGet(url, newConfig);
    }

    newGet<T>(url, config: Config): Observable<T>{
      config['responseType'] = 'json';
      return this.http.get<T>(baseURL + url, config as ConfigJSON);
    }

    post(url: string, body?, config?: Config) {
      if(!!body && !(body instanceof FormData)){
        let formData: FormData = new FormData();
        for(let prop in body){
          formData.append(prop, body[prop]);
        }
        body = formData;
      }
      if (config) {
        this.dataService.currentBarer.subscribe(barer => this.barer = barer);
        const newConfig: Config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
        // console.log('Sent post with config.');
        newConfig['responseType'] = 'json';
        return this.http.post(baseURL + url, body, newConfig as ConfigJSON);
      } else {
        // console.log('Sent post without config.');
        return this.http.post(baseURL + url, body);
      }
    }

    delete(url: string){
      this.dataService.currentBarer.subscribe(barer => this.barer = barer);
      const config: Config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
      config['responseType'] = 'json';
      return this.http.delete(baseURL + url, config);
    }
}
