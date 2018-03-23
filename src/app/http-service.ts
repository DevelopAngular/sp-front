import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../environments/environment';

const baseURL = environment.serverConfig.host;

export interface Config {
  [key: string]: any;
}

type ConfigJSON = Config & {responseType: 'json'};

@Injectable()
export class HttpService {
    constructor(private http: HttpClient) {
    }

    get<T>(url, config: Config): Observable<T> {
        config['responseType'] = 'json';
        return this.http.get<T>(baseURL + url, config as ConfigJSON);
    }

    post(url: string, body?, config?: Config) {
      if (config) {
        console.log("Sent post with config.");
        config['responseType'] = 'json';
        return this.http.post(baseURL + url, body, config as ConfigJSON);
      } else {
        console.log("Sent post without config.");
        return this.http.post(baseURL + url, body);
      }
    }
}
