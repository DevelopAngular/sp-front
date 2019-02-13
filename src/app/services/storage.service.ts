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
          this.setItem(uid, uid);
          result = this.getItem(uid) === uid;
          this.removeItem(uid);
          return result && !!localStorage;
      } catch (exception) {
        return false;
      }
  }

  getItem(key) {
     return localStorage.getItem(key);
  }

  setItem(key, data) {
     return localStorage.setItem(key, data);
  }

  removeItem(key) {
     return localStorage.removeItem(key);
  }

  clear() {
    return localStorage.clear();
  }
}
