import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {combineLatest, Observable, Subject} from 'rxjs';
import {SmartpassSearchService} from '../services/smartpass-search.service';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {debounceTime, filter, take, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-smartpass-search',
  templateUrl: './smartpass-search.component.html',
  styleUrls: ['./smartpass-search.component.scss'],
  animations: [
    trigger('inputAnimate', [
      state('open', style({
        width: '260px'
      })),
      state('close', style({
        width: '242px'
      })),
      transition('open <=> close', animate('.3s ease')),
    ]),
    trigger('logoAnimate', [
      state('open', style({
        'margin-right': '12px',
        display: 'block'
      })),
      state('close', style({
        'margin-right': '0',
        display: 'none'
      })),
      transition('open <=> close', animate('.3s ease')),
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartpassSearchComponent implements OnInit, OnDestroy {

  @Input() focused: boolean;
  @Input() height: string = '40px';
  @Input() width: string;

  public isFocus: boolean;
  public result: any[] = [];
  introsData: any;
  showTooltip$: Subject<boolean> = new Subject();
  searchLoading$: Observable<boolean>;
  searchLoaded$: Observable<boolean>;
  searchResult$: Observable<any>;
  resetInputValue$: Subject<string> = new Subject<string>();

  private destroy$ = new Subject();

  constructor(
    private router: Router,
    private spSearchService: SmartpassSearchService,
    public darkTheme: DarkThemeSwitch,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.searchResult$ = this.spSearchService.searchResult$;
    this.searchLoading$ = this.spSearchService.searchLoading$;
    this.searchLoaded$ = this.spSearchService.searchLoaded$;

    combineLatest(
      this.userService.introsData$.pipe(filter(res => !!res)),
      this.userService.nuxDates$.pipe(filter(r => !!r)),
      this.userService.user$.pipe(filter(r => !!r))
    )
      .pipe(
        debounceTime(1000),
        take(1),
        takeUntil(this.destroy$)
      ).subscribe(([intros, nuxDates, user]) => {
          this.introsData = intros;
          const showNux = moment(user.first_login).isBefore(moment(nuxDates[1].created), 'day');
          this.showTooltip$.next(!intros.search_reminder.universal.seen_version && showNux);
          this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search(value) {
    if (!value) {
      this.spSearchService.clearResult();
      return;
    }
    this.spSearchService.searchRequest(value);
  }

  goToUserPage(value) {
    this.router.navigateByUrl(`/main/student/${value.id}`);
    this.isFocus = false;
    this.resetInputValue$.next('');
    this.spSearchService.postSearchRequest(value.id);
    this.spSearchService.clearResult();
    this.cdr.detectChanges();
  }

  goToHomePage() {
    this.router.navigateByUrl(`/main/passes`);
    this.isFocus = false;
    this.resetInputValue$.next('');
    this.spSearchService.clearResult();
    this.cdr.detectChanges();
  }

  focusEvent(value) {
    this.isFocus = value;
    this.cdr.detectChanges();
  }

  closeNuxTooltip() {
    this.showTooltip$.next(false);
    this.userService.updateIntrosSearchRequest(this.introsData, 'universal',  '1');
    this.cdr.detectChanges();
  }

}
