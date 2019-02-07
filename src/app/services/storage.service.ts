import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  confirm(): boolean {
      const uid = 'confirm';
      let result;
      try {
          localStorage.setItem(uid, uid);
          result = localStorage.getItem(uid) === uid;
          localStorage.removeItem(uid);
          return result && !!localStorage;
      } catch (exception) {
        return false;
      }
  }
}
