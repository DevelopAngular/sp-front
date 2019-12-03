import {
  Component,
  ElementRef,
  EventEmitter,
  Input, OnChanges,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {BehaviorSubject, fromEvent, Observable, Subject} from 'rxjs';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../../services/http-service';
import {constructUrl} from '../../live-data/helpers';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

//Can be 'text', 'multilocation', 'multiuser', or 'dates'  There may be some places where multiuser may need to be split into student and teacher. I tried finding a better way to do this, but this is just short term.

export type RoundInputType = 'text' | 'multilocation' | 'multiuser' |  'dates';

@Component({
  selector: 'app-round-input',
  templateUrl: './round-input.component.html',
  styleUrls: ['./round-input.component.scss'],
  exportAs: 'roundInputRef'
})
export class RoundInputComponent implements OnInit, OnChanges {

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
    this.handleError();
    if (this.focused) {
      setTimeout(() => {
        this.input.nativeElement.focus();
      }, 100);
    }

    if (this.selfSearch) {
      this.pending$ = new Subject<boolean>();
    }

    if (this.isSearch) {
      fromEvent(this.input.nativeElement, 'input')
        .pipe(
          distinctUntilChanged(),
          debounceTime(300)
        )
        .subscribe((event: any) => {
            this.ontextupdate.emit(event.target.value);
        });
    }

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


  handleError() {
    if (this.selfSearch && !this.endpoint) {
      throw Error('\n \n SP Error => \n ------ \n Please provide an api endpoint for search! \n');
    }
  }

  focusAction(selected: boolean) {
    if (!selected) {
      this.blurEvent.emit(true);
    }
  }

  changeAction(inp: HTMLInputElement, reset?: boolean) {
    if (reset) {
      inp.value = '';
      inp.focus();
    }
    if (this.type === 'text') {
      if (this.selfSearch) {
        this.handleError();
        this.pending$.next(true);
        this.httpService.get(constructUrl(this.endpoint, {search: inp.value})).subscribe((res: any) => {
          this.pending$.next(false);
          this.selfSearchCompletedEvent.emit(res);
        });
      } else {
        if (!this.isSearch) {
          this.ontextupdate.emit(inp.value);
        }
      }
    }
    if ( inp.value.length > 0) {
        this.showCloseIcon.next(true);
    } else {
      setTimeout(() => {
        this.showCloseIcon.next(false);
      }, 220);
    }
  }

}
