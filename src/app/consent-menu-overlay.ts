import { OverlayContainer } from '@angular/cdk/overlay';
import {Observable, ReplaySubject} from 'rxjs';

export const UNANIMATED_CONTAINER: ReplaySubject<boolean> = new ReplaySubject(1);
export const APPLY_ANIMATED_CONTAINER: Observable<boolean> = UNANIMATED_CONTAINER.asObservable();

export class ConsentMenuOverlay extends OverlayContainer {
  _defaultContainerElement: HTMLElement;

  constructor() {
    super(document);
  }

  public setContainer( container: HTMLElement ) {
    this._defaultContainerElement = this._containerElement;
    this._containerElement = container;
  }

  public restoreContainer() {
    this._containerElement = this._defaultContainerElement;
  }
}

export function InitOverlay() {
  return new ConsentMenuOverlay();
}
