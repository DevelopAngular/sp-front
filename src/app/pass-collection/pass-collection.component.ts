import {Component, ElementRef, EventEmitter, Input, OnInit, Output, OnDestroy} from '@angular/core';
import { MatDialog } from '@angular/material';
import {BehaviorSubject, merge, of, zip,  Observable ,  ReplaySubject ,  Subject } from 'rxjs';
import { DataService } from '../services/data-service';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { PassLikeProvider } from '../models/providers';
import { Request } from '../models/Request';
import { PassLike} from '../models';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { ReportFormComponent } from '../report-form/report-form.component';
import { RequestCardComponent } from '../request-card/request-card.component';
import {mergeAll, shareReplay} from 'rxjs/operators';
import {ConsentMenuComponent} from '../consent-menu/consent-menu.component';
import { TimeService } from '../services/time.service';

import * as _ from 'lodash';
import {DarkThemeSwitch} from '../dark-theme-switch';

export class SortOption {
  constructor(private name: string, public value: string) {
  }

  toString() {
    return this.name;
  }
}

@Component({
  selector: 'app-pass-collection',
  templateUrl: './pass-collection.component.html',
  styleUrls: ['./pass-collection.component.scss']
})

export class PassCollectionComponent implements OnInit, OnDestroy {

  @Input() mock = false;
  @Input() displayState = 'grid';
  @Input() title: string;
  @Input() icon: string;
  @Input() emptyMessage;
  @Input() columns = 3;
  @Input() fromPast = false;
  @Input() forFuture = false;
  @Input() isActive = false;
  @Input() forStaff = false;
  @Input() forMonitor = false;
  @Input() hasSort = false;
  @Input() maxHeight;
  @Input() showEmptyHeader: boolean;
  @Input() columnViewIcon: boolean = true;

  @Input() passProvider: PassLikeProvider;

  @Output() sortMode = new EventEmitter<string>();
  @Output() reportFromPassCard = new EventEmitter();

  currentPasses$: Observable<PassLike[]>;
  currentPasses: PassLike[] = [];

  timers: number[] = [];

  timerEvent: Subject<void> = new BehaviorSubject(null);

  // sortOptions = [
  //     { display: 'Pass Expiration Time', color: this.darkTheme.getColor(), action: 'expiration_time', toggle: false },
  //     { display: 'Student Name', color: this.darkTheme.getColor(), action: 'student_name', toggle: false },
  //     { display: 'To Location', color: this.darkTheme.getColor(), action: 'destination_name', toggle: false }
  // ];

  sort$ = this.dataService.sort$;
  test: any;

  private static getDetailDialog(pass: PassLike): any {
    if (pass instanceof HallPass) {
      return PassCardComponent;
    }

    if (pass instanceof Invitation) {
      return InvitationCardComponent;
    }

    // noinspection SuspiciousInstanceOfGuard
    if (pass instanceof Request) {
      return RequestCardComponent;
    }

    return null;
  }
  constructor(
      public dialog: MatDialog,
      private dataService: DataService,
      private timeService: TimeService,
      public darkTheme: DarkThemeSwitch
  ) {}

  ngOnInit() {
      if (this.mock) {

      } else {
        this.currentPasses$ = this.passProvider.watch(this.sort$.asObservable()).pipe(shareReplay(1));
        this.currentPasses$.subscribe((passes) => {
            this.currentPasses = passes;
          });
      }
        if (this.isActive) {
          this.timers.push(window.setInterval(() => {
            this.timerEvent.next(null);
          }, 1000));
        }
        // this.currentPasses$.subscribe((data) => {
        //   console.log(data);
        //   this.test = data[0];
        // });
  }

  ngOnDestroy() {
    this.timers.forEach(id => {
      console.log('Clearing interval');
      clearInterval(id);
    });
    this.timers = [];
  }

  get _icon() {
    return this.darkTheme.getIcon({
      iconName: this.icon,
      darkFill: 'White',
      lightFill: 'Navy',
      setting: null
    });
  }
  get _color() {
    return this.darkTheme.getColor({dark: '#FFFFFF', white: '#1F195E'});

  }
  getEmptyMessage() {
    return this.emptyMessage;
  }

  showPass(pass: PassLike) {
    this.dataService.markRead(pass).subscribe();
    this.initializeDialog(pass);
  }

  onSortSelected(sort: string) {
    this.sort$.next(sort);
    this.sortMode.emit(sort);
  }

  initializeDialog(pass: PassLike) {
    const now = this.timeService.nowDate();
    now.setSeconds(now.getSeconds() + 10);

    let data: any;

    if (pass instanceof HallPass) {
      data = {
        pass: pass,
        fromPast: pass['end_time'] < now,
        forFuture: pass['start_time'] > now,
        forMonitor: this.forMonitor,
        forStaff: this.forStaff,
      };
      data.isActive = !data.fromPast && !data.forFuture;
    } else {
      data = {
        pass: pass,
        fromPast: this.fromPast,
        forFuture: this.forFuture,
        forMonitor: this.forMonitor,
        isActive: this.isActive,
        forStaff: this.forStaff,
      };
    }
    const dialogRef = this.dialog.open(PassCollectionComponent.getDetailDialog(pass), {
      panelClass: (this.forStaff ? 'teacher-' : 'student-') + 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      data: data,
    });

    dialogRef.afterClosed().subscribe(dialogData => {
      console.log('Closed with ===>', dialogData);
      if (dialogData && dialogData['report']) {
        const reportRef = this.dialog.open(ReportFormComponent, {
          width: '425px',
          height: '500px',
          panelClass: 'form-dialog-container',
          backdropClass: 'custom-backdrop',
          data: {'report': dialogData['report']}
        });
        reportRef.afterClosed().subscribe(dd => {
          this.reportFromPassCard.emit(dd);
        });
      }
    });
  }

  openSortDialog(event) {

    // this.sortOptions.forEach((opt) => opt.color = this.darkTheme.getColor());
    const sortOptions = [
      { display: 'Pass Expiration Time', color: this.darkTheme.getColor(), action: 'expiration_time', toggle: false },
      { display: 'Student Name', color: this.darkTheme.getColor(), action: 'student_name', toggle: false },
      { display: 'To Location', color: this.darkTheme.getColor(), action: 'destination_name', toggle: false }
    ];

    const sortDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'header': 'SORT BY',
          'options': sortOptions,
          'trigger': new ElementRef(event.currentTarget),
          'isSort': true,
          'sortMode': this.dataService.sort$.value
        }
    });

    sortDialog.afterClosed().subscribe(sortMode => {
      this.onSortSelected(sortMode);
    });
  }

}
