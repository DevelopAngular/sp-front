import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {optionsView} from '../consent-menu/consent-menu.component';
import {ConsentMenuMobileAnimations} from './consent-menu-mobile.animations';
import {Subject} from 'rxjs';
import {DomCheckerService} from '../services/dom-checker.service';
import {takeUntil} from 'rxjs/operators';
import {DeviceDetection} from '../device-detection.helper';

@Component({
  selector: 'app-consent-menu-mobile',
  templateUrl: './consent-menu-mobile.component.html',
  styleUrls: ['./consent-menu-mobile.component.scss'],
  animations: [ConsentMenuMobileAnimations.menuAppearance]
})
export class ConsentMenuMobileComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() header: string;
  @Input() options: any[];
  @Input() optionsView: optionsView = 'inline';
  @Input() ConsentText: string;
  @Input() ConsentYesText: string;
  @Input() ConsentNoText: string;
  @Input() ConsentButtonColor: string;
  @Input() display: boolean;
  @Input() appendToBody: boolean;

  @Input() isSort = false;
  @Input() sortMode;

  @Output() cancelClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() backDropClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() receiveOption: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('consentMenu') consentMenu: ElementRef<HTMLElement>;

  destroyer$: Subject<any> = new Subject<any>();
  backDropDiv: HTMLDivElement;
  backDropContainer: Element;

  constructor(
    private sanitizer: DomSanitizer,
    private domChecker: DomCheckerService,
    private renderer: Renderer2,
    public darkTheme: DarkThemeSwitch,
  ) {
  }

  get isIOS() {
    return DeviceDetection.isIOSMobile();
  }

  ngOnInit() {
    this.backDropDiv = this.renderer.createElement('div');
  }

  ngAfterViewInit(): void {
    this.domChecker.domElement$
      .pipe(takeUntil(this.destroyer$))
      .subscribe((menuElement: ElementRef<HTMLElement>) => {
        if (this.isIOS) {
          this.backDropContainer = menuElement.nativeElement.closest('mat-sidenav-container');
          this.createIOSBackdrop(this.backDropContainer);
          this.renderer.appendChild(this.backDropContainer, this.backDropDiv);
        }
        if (this.appendToBody) {
          this.renderer.appendChild(document.body, menuElement.nativeElement);
          this.renderer.setStyle(document.body, 'overflow', 'hidden');
        }
      });
  }

  ngOnDestroy() {
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  getColor(option) {
    return this.sanitizer.bypassSecurityTrustStyle(option.color);
  }

  getConcentButtonColor(color) {
    return this.sanitizer.bypassSecurityTrustStyle(color);
  }

  cancel() {
    this.cancelClick.emit();
    if (this.isIOS) {
      this.renderer.removeChild(this.backDropContainer, this.backDropDiv);
    }
  }

  onBackdropClick() {
    this.backDropClick.emit();
  }

  sendOptionAction(action: any) {
    this.receiveOption.emit(action);
    if (this.isIOS) {
      this.renderer.removeChild(this.backDropContainer, this.backDropDiv);
    }
  }

  createIOSBackdrop(container: Element) {
    container.addEventListener('touchmove', (e) => {
      if (this.display) {
        e.preventDefault();
      } else {
        return true;
      }
    });
    this.backDropDiv.classList.add('cdk-overlay-backdrop', 'custom-backdrop', 'cdk-overlay-backdrop-showing', 'z-index-15');
    this.backDropDiv.addEventListener('click', () => {
      this.onBackdropClick();
      this.renderer.removeChild(container, this.backDropDiv);
    });
  }
}

