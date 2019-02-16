import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  memoryStore: any = {};

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
        if (!this.memoryStore[key]) {
            return null;
        }
        return this.memoryStore[key];
    }
  }

  setItem(key, data) {
      if (this.confirm()) {
        return localStorage.setItem(key, data);
      } else {
          if (this.memoryStore[key]) {
              this.removeItem(key);
          }
          return this.memoryStore[key] = data;
      }
  }

  removeItem(key) {
      if (this.confirm()) {
        return localStorage.removeItem(key);
      }
      return delete this.memoryStore[key];
  }

  clear() {
    if (this.confirm()) {
      return localStorage.clear();
    } else {
      this.memoryStore = {};
    }
  }
}
