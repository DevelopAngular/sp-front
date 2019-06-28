import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {optionsView} from '../consent-menu/consent-menu.component';
import {ConsentMenuMobileAnimations} from './consent-menu-mobile.animations';


@Component({
  selector: 'app-consent-menu-mobile',
  templateUrl: './consent-menu-mobile.component.html',
  styleUrls: ['./consent-menu-mobile.component.scss'],
  animations: [ConsentMenuMobileAnimations.menuAppearance]
})
export class ConsentMenuMobileComponent implements OnInit, OnDestroy {

  @Input() header: string;
  @Input() options: any[];
  @Input() optionsView: optionsView = 'inline';
  @Input() ConsentText: string;
  @Input() ConsentYesText: string;
  @Input() ConsentNoText: string;
  @Input() ConsentButtonColor: string;
  @Input() display: boolean;

  @Input() isSort = false;
  @Input() sortMode;

  @Output() cancelClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() backDropClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() receiveOption: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private sanitizer: DomSanitizer,
    public darkTheme: DarkThemeSwitch
  ) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  getColor(option) {
    return this.sanitizer.bypassSecurityTrustStyle(option.color);
  }

  getConcentButtonColor(color) {
    return this.sanitizer.bypassSecurityTrustStyle(color);
  }

  cancel() {
    this.cancelClick.emit();
  }

  onBackdropClick() {
    this.backDropClick.emit();
  }

  sendOptionAction(action: any) {
    this.receiveOption.emit(action);
  }
}
