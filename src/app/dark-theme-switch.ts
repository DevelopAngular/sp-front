import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';
import {StorageService} from './services/storage.service';
import {DeviceDetection} from './device-detection.helper';

declare const window;

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

export type SPTheme = 'Light' | 'Dark' | 'Auto';

const lightMode: MediaQueryList = window.matchMedia('(prefers-color-scheme: light)');
const darkMode: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

function listenSysLight(evt: MediaQueryListEvent) {
  if (evt.matches) {
    this.isEnabled$.next(false);
  }
}

function listenSysDark(evt: MediaQueryListEvent) {
  if (evt.matches) {
    this.isEnabled$.next(true);
  }
}


@Injectable({
  providedIn: 'root'
})
export class DarkThemeSwitch {

  public preloader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public isEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  private lightLink = listenSysLight.bind(this);
  private darkLink = listenSysDark.bind(this);

  constructor(
    private storage: StorageService
  ) {
    const currentTheme: SPTheme = this.storage.getItem('appearance');
    this.switchTheme(currentTheme ? currentTheme : 'Auto');
  }

  private listenSystemThemePreference(predict: boolean) {
    if (predict) {
      lightMode.addListener(function () {
        if (lightMode.matches) {
          this.isEnabled$.next(false);
        }
        return this.lightLink;
      }.call(this));
      darkMode.addListener(function () {
        if (darkMode.matches) {
          this.isEnabled$.next(true);
        }
        return this.darkLink;
      }.call(this));
    } else {
      lightMode.removeListener(this.lightLink);
      darkMode.removeListener(this.darkLink);
    }
  }

  switchTheme(theme: SPTheme = 'Auto') {
    this.storage.setItem('appearance', theme);
    switch (theme) {
      case 'Light':
        this.listenSystemThemePreference(false);
        this.isEnabled$.next(false);
        break;
      case 'Dark':
        this.listenSystemThemePreference(false);
        this.isEnabled$.next(true);
        break;
      case 'Auto':
        this.listenSystemThemePreference(true);
        break;
    }
  }

  currentTheme() {
    return this.storage.getItem('appearance') ? this.storage.getItem('appearance') : 'Auto';
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
        fill = config.hover && config.hoveredColor === config.setting.background ? 'White' : 'Blue-Gray';
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
        if (config.hover && config.hoveredColor === config.setting.background) {
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
        case 'default':
          return '#0F171E';
        case 'middle':
          return '#1E194F';
        case 'high':
          return '#134482';
      }
    } else {
      switch (tone) {
        case 'low':
          return reverse ? '#7F879D' : '#FFFFFF';
        case 'middle':
          return reverse ? '#F4F4F4' : '#7F879D';
        case 'high':
          return reverse ? '#FFFFFF' : '#7F879D';
        case 'extra':
          return reverse ? '#7F879D' : '#F4F4F4';
        case 'default':
          return reverse ? '#7F879D' : '#FBFEFF';
      }
    }
  }
}
