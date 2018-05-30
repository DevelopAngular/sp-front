import { Injectable } from '@angular/core';

export enum Level {
  OFF = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  LOG = 5,
}

interface IArgs {
  [index: number]: any;

  length: number;
}

const consoleLogFunctions = [];

consoleLogFunctions[Level.ERROR] = console['error'] || console.log;
consoleLogFunctions[Level.WARN] = console['warn'] || console.log;
consoleLogFunctions[Level.INFO] = console['info'] || console.log;
consoleLogFunctions[Level.DEBUG] = console['debug'] || console.log;
consoleLogFunctions[Level.LOG] = console.log;

function logConsole(level: Level, args: IArgs) {
  if (consoleLogFunctions[level]) {
    consoleLogFunctions[level].apply(console, args);
  }
}


@Injectable({
  providedIn: 'root'
})
export class Logger {

  constructor() {
    console.log('Logging level: ' + Level[this.level]);

    // Pre-bind logging functions.
    // This allows use such as .subscribe(_logger.warn) or .then(_logger.warn)
    const my_this = this;
    for (const key of ['error', 'warn', 'info', 'debug', 'log']) {
      this[key] = function () {
        Logger.prototype[key].apply(my_this, arguments);
      };
    }

    (window as any)['setLoggingLevel'] = function (level: string) {
      level = level.toUpperCase();
      if (Level.hasOwnProperty(level)) {
        my_this.level = Level[level] as any as Level;
        console.log(`Logging level set to ${level}`);
      } else {
        console.log(`Invalid logging level: ${level}`);
      }
    };

  }

  isEnabled(level: Level): boolean {
    return level <= this.level;
  }

  private _logInternal(level: Level, args: IArgs) {
    if (this.isEnabled(level)) {
      logConsole(level, args);
    }
  }

  get level(): Level {
    const savedLevel = localStorage.getItem('logger_service_level');
    if (savedLevel) {
      return +savedLevel;
    } else {
      return Level.WARN;
    }
  }

  set level(l: Level) {
    localStorage.setItem('logger_service_level', '' + l);
  }

  // Proxy log methods

  error(...args: any[]) {
    this._logInternal(Level.ERROR, args as IArgs);
  }

  warn(...args: any[]) {
    this._logInternal(Level.WARN, args as IArgs);
  }

  info(...args: any[]) {
    this._logInternal(Level.INFO, args as IArgs);
  }

  debug(...args: any[]) {
    this._logInternal(Level.DEBUG, args as IArgs);
  }

  log(...args: any[]) {
    this._logInternal(Level.LOG, args as IArgs);
  }
}
