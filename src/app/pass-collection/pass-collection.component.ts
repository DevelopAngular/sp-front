import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs/Subject';
import { DataService } from '../data-service';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { PassLikeProvider } from '../models/providers';
import { Request } from '../models/Request';
import { PassLike} from '../models';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { ReportFormComponent } from '../report-form/report-form.component';
import { RequestCardComponent } from '../request-card/request-card.component';
import { shareReplay } from 'rxjs/operators';
import {ConsentMenuComponent} from '../consent-menu/consent-menu.component';

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

export class PassCollectionComponent implements OnInit {

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

  @Input() passProvider: PassLikeProvider;

  @Output() sortMode = new EventEmitter<string>();

  currentPasses$;

  sortOptions = [
      { display: 'Pass Expiration Time', color: 'darkBlue', action: 'expiration_time', toggle: false },
      { display: 'Student Name', color: 'darkBlue', action: 'student_name', toggle: false },
      { display: 'To Location', color: 'darkBlue', action: 'destination_name', toggle: false }
  ];

  sort$ = this.dataService.sort$;

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
  ) {}

  ngOnInit() {
      this.currentPasses$ = this.passProvider.watch(this.sort$.asObservable()).pipe(shareReplay(100));
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
    const now = new Date();
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
      panelClass: 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      data: data,
    });

    dialogRef.afterClosed().subscribe(dialogData => {
      if (dialogData && dialogData['report']) {
        const reportRef = this.dialog.open(ReportFormComponent, {
          width: '750px',
          panelClass: 'form-dialog-container',
          backdropClass: 'custom-backdrop',
          data: {'report': dialogData['report']}
        });
      }
    });
  }

  openSortDialog(event) {
    const sortDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'header': 'SORT BY',
          'options': this.sortOptions,
          'trigger': new ElementRef(event.currentTarget),
          'isSort': true,
        }
    });
  }

}
