import { Injectable } from '@angular/core';
import { ShortcutEventOutput, ShortcutInput } from 'ng-keyboard-shortcuts';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {

  shortcuts: ShortcutInput[] = [];

  onPressKeyEvent$: Subject<ShortcutEventOutput> = new Subject<ShortcutEventOutput>();

  constructor() {
  }

  initialize() {
    const self = this;
    this.shortcuts.push(
      {
        key: ['s'],
        command(event: ShortcutEventOutput): any {
          self.onPressKeyEvent$.next(event);
        },
        preventDefault: true
      },
      {
        key: ['n'],
        command(event: ShortcutEventOutput): any {
          self.onPressKeyEvent$.next(event);
        },
        preventDefault: true
      },
      {
        key: ['f'],
        command(event: ShortcutEventOutput): any {
          self.onPressKeyEvent$.next(event);
        },
        preventDefault: true
      },
      {
        key: [','],
        command(event: ShortcutEventOutput): any {
          self.onPressKeyEvent$.next(event);
        },
        preventDefault: true
      },
      {
        key: ['a'],
        command(event: ShortcutEventOutput): any {
          self.onPressKeyEvent$.next(event);
        },
        preventDefault: true
      },
      {
        key: ['d'],
        command(event: ShortcutEventOutput): any {
          self.onPressKeyEvent$.next(event);
        },
        preventDefault: true
      },
      {
        key: ['e'],
        command(event: ShortcutEventOutput): any {
          self.onPressKeyEvent$.next(event);
        },
        preventDefault: true
      },
      {
        key: ['r'],
        command(event: ShortcutEventOutput): any {
          self.onPressKeyEvent$.next(event);
        },
        preventDefault: true
      }
    );
  }

  add(elem: ShortcutInput) {
    this.shortcuts.push(elem);
  }
}
