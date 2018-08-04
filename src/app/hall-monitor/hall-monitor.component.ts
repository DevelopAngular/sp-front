import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { DataService } from '../data-service';
import { LoadingService } from '../loading.service';
import { PassLikeProvider } from '../models';
import { ColorProfile } from '../models/ColorProfile';
import { HallPass } from '../models/HallPass';
import { Location } from '../models/Location';
import { User } from '../models/User';
import { ReportFormComponent } from '../report-form/report-form.component';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
}

class ActivePassProvider implements PassLikeProvider {

  constructor(private dataService: DataService) {
  }

  watch(sort: Observable<string>) {
    return this.dataService.watchActiveHallPasses(sort);
  }
}

class TestActivePassProvider implements PassLikeProvider {
  testStudent = new User('testStudent', new Date(), new Date(), 'Kyle', 'Cook', 'Kyle Cook', 'mail@mail.com', []);
  testIssuer = new User('testIssuer', new Date(), new Date(), 'Donald', 'Sawyer', 'Don Sawyer', 'mail@mail.com', []);
  testOrigin = new Location('testOrigin', 'Ladson', 'MHS', 'C123', 'classroom', false, [], [], [], 15, false);
  testDestination = new Location('testDestination', 'Water Fountain', 'MHS', 'WF', '', false, [], ['round_trip', 'one_way'], [], 15, false);
  testColorProfile = new ColorProfile('testColorProfile', 'Light-blue', '#0B9FC1,#00C0C7', '#07ABC3', '#11CFE5', '#0B9FC1', '#18EEF7');
  testDate: Date = new Date();
  testPass1: HallPass;
  testPass2: HallPass;
  testPass3: HallPass;
  testPass4: HallPass;

  passes: HallPass[];

  constructor() {
    this.testDate.setMinutes(this.testDate.getMinutes() + 1);

    this.testPass1 = new HallPass('testPass1', this.testStudent, this.testIssuer,
      new Date(), new Date(), new Date(),
      this.testDate, this.testDate, this.testOrigin,
      this.testDestination, 'round_trip', '#1893E9,#05B5DE',
      'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);

    this.testDate = new Date();
    this.testDate.setDate(this.testDate.getDate() + 4);
    this.testPass2 = new HallPass('testPass2', this.testStudent, this.testIssuer,
      new Date(), new Date(), this.testDate,
      new Date(), new Date(), this.testOrigin,
      this.testDestination, 'round_trip', '#1893E9,#05B5DE',
      'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);

    this.testDate = new Date();
    this.testDate.setDate(this.testDate.getDate() - 1);
    this.testPass3 = new HallPass('testPass3', this.testStudent, this.testIssuer,
      new Date(), new Date(), this.testDate,
      new Date(), new Date(), this.testOrigin,
      this.testDestination, 'one_way', '#1893E9,#05B5DE',
      'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);
    this.testDate = new Date();
    this.testDate.setDate(this.testDate.getDate() + 1);
    this.testPass4 = new HallPass('testPass4', this.testStudent, this.testIssuer,
      new Date(), new Date(), this.testDate,
      new Date(), new Date(), this.testOrigin,
      this.testDestination, 'one_way', '#1893E9,#05B5DE',
      'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);

    this.passes = [this.testPass1, this.testPass2, this.testPass3, this.testPass4];
  }

  watch(sort: Observable<string>) {
    return Observable.of(Array.from(this.passes));
  }
}

@Component({
  selector: 'app-hall-monitor',
  templateUrl: './hall-monitor.component.html',
  styleUrls: ['./hall-monitor.component.scss']
})
export class HallMonitorComponent implements OnInit {

  activePassProvider: PassLikeProvider;

  inputValue = '';

  user: User;
  isStaff = false;
  canView = false;

  constructor(public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService, public dialog: MatDialog) {
    this.activePassProvider = new ActivePassProvider(this.dataService);
    // this.activePassProvider = new TestActivePassProvider();
  }

  get isStaff$(): Observable<boolean> {
    return this.dataService.currentUser.map(isUserStaff);
  }

  ngOnInit() {
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
          this.canView = user.roles.includes('view_traveling_users');
        });
      });
  }

  openReportForm() {
    const dialogRef = this.dialog.open(ReportFormComponent, {
      width: '750px',
      height: '365px',
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
    });
  }

  onSearch(search: string) {
    this.dataService.updateHMSearch(search);
  }

}
