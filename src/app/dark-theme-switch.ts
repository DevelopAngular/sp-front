import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';
import {StorageService} from './services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class DarkThemeSwitch {

  public isEnabled$: BehaviorSubject<boolean>;

  constructor(
    private storage: StorageService
  ) {
    const isDarkTheme = JSON.parse(this.storage.getItem('dark-theme'));
    this.isEnabled$ = new BehaviorSubject<boolean>(isDarkTheme);
  }

  isDarkNow() {
    return this.isEnabled$.value;
  }

  switchTheme() {
    const isDarkTheme = this.isEnabled$.value;
    this.storage.setItem('dark-theme', !isDarkTheme);
    this.isEnabled$.next(!isDarkTheme);
  }

}
