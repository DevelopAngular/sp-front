import {
  Component,
  ElementRef,
  EventEmitter,
  Input, OnChanges, OnDestroy,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {BehaviorSubject, fromEvent, Observable, of, Subject} from 'rxjs';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../../services/http-service';
import {constructUrl} from '../../live-data/helpers';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil, tap} from 'rxjs/operators';

//Can be 'text', 'multilocation', 'multiuser', or 'dates'  There may be some places where multiuser may need to be split into student and teacher. I tried finding a better way to do this, but this is just short term.

export type RoundInputType = 'text' | 'multilocation' | 'multiuser' |  'dates';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.scss'],
  exportAs: 'roundInputRef'
})
export class RoundInputComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('input') input: ElementRef;

  @Input() selfSearch: boolean = false;
  @Input() endpoint: string;

  @Input() labelText: string;
  @Input() placeholder: string;
  @Input() type: RoundInputType = 'text';
  @Input() initialValue: string = ''; // Allowed only if type is multi*
  @Input() html5type: string = 'text'; // text, password, number etc.
  @Input() hasTogglePicker: boolean;
  @Input() boxShadow: boolean = true;
  @Input() height: string = '40px';
  @Input() width: string;
  @Input() minWidth: string = '300px';
  @Input() fieldIcon: string = './assets/Search Normal (Search-Gray).svg';
  @Input() fieldIconPosition: string = 'left'; // Can be 'right' or 'left'
  @Input() closeIcon: boolean = false;
  @Input() disabled: boolean = false;
  @Input() focused: boolean = false;
  @Input() pending$: Subject<boolean>;
  @Input() selectReset$: Subject<string>;
  @Input() selections: any[] = [];
  @Input() isSearch: boolean;
  @Input() backgroundColor: string = '#FFFFFF';

  @Output() ontextupdate: EventEmitter<any> = new EventEmitter();
  @Output() ontoggleupdate: EventEmitter<any> = new EventEmitter();
  @Output() onselectionupdate: EventEmitter<any> = new EventEmitter();
  @Output() controlValue = new EventEmitter();
  @Output() blurEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output() selfSearchCompletedEvent: EventEmitter<any> = new EventEmitter<any>();

  closeIconAsset: string = './assets/Cancel (Search-Gray).svg';
  showCloseIcon: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  selected: boolean;
  value: string;

  public e: Observable<Event>;
  private destroyer$ = new Subject<any>();

  constructor (
    public httpService: HttpService,
    public dialog: MatDialog,
    public darkTheme: DarkThemeSwitch,
    public sanitizer: DomSanitizer,
  ) { }

  get labelIcon() {
    if (this.selected) {
      return this.darkTheme.getIcon(

        {
          iconName: 'Search Eye',
          darkFill: 'White',
          lightFill: 'Navy'
        }
      );
    } else {
      return './assets/Search Eye (Blue-Gray).svg';
    }
  }

  get labelColor() {
    if (this.selected) {
      return this.darkTheme.getColor({
        white: '#1D1A5E',
        dark: '#FFFFFF'
      });
    } else {
      return '#7F879D';
    }
  }

  get _boxShadow() {
    return this.sanitizer.bypassSecurityTrustStyle(this.boxShadow ? '0 0 6px 0 rgba(0, 0, 0, 0.1)' : 'none');
  }

  ngOnInit() {
    if (this.focused) {
      setTimeout(() => {
        this.input.nativeElement.focus();
      }, 100);
    }

      fromEvent(this.input.nativeElement, 'input')
        .pipe(
          (this.isSearch ? (distinctUntilChanged(), debounceTime(300)) : tap()),
          takeUntil(this.destroyer$)
        )
        .subscribe((event: any) => {
          if ( event.target.value.length > 0) {
            this.showCloseIcon.next(true);
          } else {
            setTimeout(() => {
              this.showCloseIcon.next(false);
            }, 220);
          }
          this.ontextupdate.emit(event.target.value);
        });

    if (!this.type.includes('multi') && this.type !== 'text') {
      this.initialValue = '';
    }
    this.value = this.initialValue;



    if (this.selectReset$) {
      this.selectReset$.subscribe((_value: string) => {
        this.value = _value;
      });
    }

  }

  ngOnChanges(sc: SimpleChanges) {
    console.log(sc);
    if ('focused' in sc && !sc.focused.isFirstChange() && sc.focused.currentValue) {
      this.input.nativeElement.focus();
    }
  }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  focusAction(selected: boolean) {
    if (!selected) {
      this.blurEvent.emit(true);
    }
  }

  reset() {
      this.input.nativeElement.value = '';
      this.input.nativeElement.focus();
      this.ontextupdate.emit('');
  }

}
