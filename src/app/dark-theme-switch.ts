import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';
import {StorageService} from './services/storage.service';

export type Tone = 'low' | 'middle' | 'high' | 'default' | 'extra';
export interface ColorConfig {
  setting?: any;
  hover?: boolean;
  hoveredColor?: string;
  dark?: string;
  white?: string;
}
export interface IconConfig {
  iconName?: string;
  darkFill?: string;
  lightFill?: string;
  setting?: any;
  hover?: boolean;
  hoveredColor?: string;
  static?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DarkThemeSwitch {

  public preloader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
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

  getIcon(config: IconConfig  = {
    darkFill: 'White',
    lightFill: 'Navy'
  }) {

    const iconName = /[A-Z]{1}[\w\s]+[^( \()]/;

    if (config.iconName.match(iconName)) {
      config.iconName = config.iconName.match(iconName)[0];
    }

    let fill: string;

    if (config.setting) {
      if (this.isEnabled$.value) {
        fill = 'White';
      } else {
        fill = config.hover && config.hoveredColor === config.setting.gradient ? 'White' : 'Blue-Gray';
      }
    }

    if (!config.setting) {
      if (this.isEnabled$.value) {
        fill = config.hover ? 'Navy' : 'White';
      } else {
        fill = config.hover ? 'Navy' : 'Blue-Gray';
      }
    }
    if (this.isEnabled$.value && config.darkFill) {
      fill = config.darkFill;
    }
    if (!this.isEnabled$.value && config.lightFill) {
      fill = config.lightFill;

    }
    if (config.static) {
      fill = config.lightFill || config.darkFill;
    }

    return `./assets/${config.iconName} (${fill}).svg`;
  }

  getColor(config: ColorConfig = {
    dark: '#FFFFFF',
    white: '#1E194F'
  }) {

    if (config.dark && config.white) {
      if (this.isEnabled$.value) {
        return config.dark;
      } else {
        return config.white;
      }
    }

    if (config.setting) {
      if (this.isEnabled$.value) {
        return '#EFEFEF';
      } else {
        if (config.hover && config.hoveredColor === config.setting.gradient) {
          return '#EFEFEF';
        } else {
          return '#7F879D';
        }
      }
    }

    if (config.hover) {
      return '#1F195E';
    } else {
      if (this.isEnabled$.value) {
        return '#EFEFEF';
      } else {
        return '#7F879D';
      }
    }

  }

  getBackground(tone: Tone, reverse: boolean = false) {
    if (this.isEnabled$.value) {
      switch (tone) {
        case 'low':
          case 'extra':
            return '#0F171E';
          break;
        case 'default':
          return '#0F171E';
          break;
        case 'middle':
          return '#1E194F';
        case 'high':
          return '#134482';
          break;
        // case 'extra':
        //   return '#0F171E';
        //   break;
      }
    } else {
      switch (tone) {
        case 'low':
          return reverse ? '#7F879D' : '#FFFFFF';
          break;
        case 'middle':
          return reverse ? '#FFFFFF' : '#7F879D';
          break;
        case 'high':
          return reverse ? '#F4F4F4' : '#7F879D';
          break;
        case 'extra':
          return reverse ? '#7F879D' : '#F4F4F4';
          break;
        case 'default':
          return reverse ? '#7F879D' : '#FBFEFF';
          break;
      }
    }
  }

  get isColorSwitched() {
    return this.isEnabled$.asObservable();
  }
}
