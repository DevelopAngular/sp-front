import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  inMamory: any = {};

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

  getItem(key) {
    if (this.confirm()) {
      return localStorage.getItem(key);
    } else {
        if (!this.inMamory[key]) {
            return null;
        }
        return this.inMamory[key];
    }
  }

  setItem(key, data) {
      if (this.confirm()) {
        return localStorage.setItem(key, data);
      } else {
          if (this.inMamory[key]) {
              this.removeItem(key);
          }
          return this.inMamory[key] = data;
      }
  }

  removeItem(key) {
      if (this.confirm()) {
        return localStorage.removeItem(key);
      }
      return delete this.inMamory[key];
  }

  clear() {
    if (this.confirm()) {
      return localStorage.clear();
    } else {
      this.inMamory = {};
    }
  }
}
