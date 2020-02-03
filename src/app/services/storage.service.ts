import { Injectable } from '@angular/core';
import {fromEvent} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {SignedOutToastComponent} from '../signed-out-toast/signed-out-toast.component';
declare const window;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  memoryStore: any = {};

  constructor(
    private router: Router,
    private matDialog: MatDialog,
  ) {

  }

  detectChanges() {
    fromEvent(window, 'storage')
      .pipe(
        filter((evt: StorageEvent) => evt.key === 'google_auth' && evt.newValue === null && this.router.url !== ''),
      )
      .subscribe((evt) => {
        this.matDialog.open(SignedOutToastComponent, {
                panelClass: 'form-dialog-container-white',
                backdropClass: 'white-backdrop',
                data: {}
              });
      });
  }

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
