import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { DataService } from '../data-service';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { HallPass, Invitation, Request } from '../NewModels';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { ReportFormComponent } from '../report-form/report-form.component';
import { RequestCardComponent } from '../request-card/request-card.component';

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

  @Input() passes: HallPass[] | Invitation[] | Request[];
  @Input() displayState: string = 'list';
  @Input() title: string;
  @Input() icon: string;
  @Input() columns: number = 3;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;
  @Input() isActive: boolean = false;
  @Input() forStaff: boolean = false;
  @Input() forMonitor: boolean = false;
  @Input() hasSort: boolean = false;

  type: string;
  sortOptions: SortOption[] = [
    new SortOption('Created', 'created'),
    new SortOption('Student', 'student_name'),
    new SortOption('Expiration', 'expiration_time'),
    new SortOption('Destination', 'destination_name')
  ];

  sort$ = new Subject<string>();

  passes$: Observable<HallPass[]>;

  constructor(public dialog: MatDialog, private dataService: DataService) {
    this.passes$ = this.dataService.watchActiveHallPasses(this.sort$.asObservable());
  }

  ngOnInit() {
    this.type = (this.passes[0] instanceof HallPass) ? 'hallpass' :
      (this.passes[0] instanceof Invitation) ? 'invitation' :
        'request';
  }

  showPass(pass: HallPass | Invitation | Request) {
    this.initializeDialog(this.type === 'hallpass' ? PassCardComponent : (this.type === 'invitation' ? InvitationCardComponent : RequestCardComponent), pass);
  }

  onSortSelected(sort: string) {
    this.sort$.next(sort);
  }

  initializeDialog(component: any, pass: any) {
    let fromPast = this.type==='hallpass'?!pass['end_time']:this.fromPast;
    let now = new Date();
    now.setSeconds(now.getSeconds()+10);
    let forFuture = this.type==='hallpass'?(pass['start_time'] > now):this.forFuture;
    let isActive = this.type==='hallpass'?(!forFuture && !fromPast):this.isActive
    console.log('Past: ', fromPast, 'Future: ', forFuture, 'Active: ', isActive);

    const dialogRef = this.dialog.open(component, {
      panelClass: 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {
        'pass': pass,
        'fromPast': fromPast,
        'forFuture': forFuture,
        'forMonitor': this.forMonitor,
        'isActive': isActive,
        'forStaff': this.forStaff
      }
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

}
