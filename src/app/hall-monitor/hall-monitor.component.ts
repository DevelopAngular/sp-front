import { Component, OnInit, NgZone } from '@angular/core';
import { User, Location, ColorProfile, HallPass } from '../NewModels';
import { Observable } from '../../../node_modules/rxjs';
import { DataService } from '../data-service';
import { LoadingService } from '../loading.service';
import { ReportFormComponent } from '../report-form/report-form.component';
import { MatDialog } from '../../../node_modules/@angular/material';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
}

@Component({
  selector: 'app-hall-monitor',
  templateUrl: './hall-monitor.component.html',
  styleUrls: ['./hall-monitor.component.scss']
})
export class HallMonitorComponent implements OnInit {

  testStudent = new User('testStudent', new Date(), new Date(), 'Kyle', 'Cook', 'Kyle Cook', 'mail@mail.com', []);
  testIssuer = new User('testIssuer', new Date(), new Date(), 'Donald', 'Sawyer', 'Don Sawyer', 'mail@mail.com', []);
  testOrigin = new Location('testOrigin', 'Ladson', 'MHS', 'C123', 'classroom', false, [], [], [], 15, false);
  testDestination = new Location('testDestination', 'Water Fountain', 'MHS', 'WF', '', false, [], ['round_trip', 'one_way'], [], 15, false);
  testColorProfile = new ColorProfile('testColorProfile', 'Light-blue', '#0B9FC1,#00C0C7', '#07ABC3', '#11CFE5', '#0B9FC1', '#18EEF7')
  testDate:Date = new Date();

  testPass1: HallPass;
  testPass2: HallPass;
  testPass3: HallPass;
  testPass4: HallPass;
  testPasses: HallPass[] = [];

  inputValue: string = '';

  user: User;
  isStaff: boolean= false;;

  constructor(public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService, public dialog: MatDialog) {
    this.testDate.setMinutes(this.testDate.getMinutes()+1);

    this.testPass1 = new HallPass('testPass1', this.testStudent, this.testIssuer,
                                  new Date(), new Date(), new Date(),
                                  this.testDate, this.testDate, this.testOrigin, 
                                  this.testDestination, 'round_trip', '#1893E9,#05B5DE',
                                  'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);
                                  
    this.testDate = new Date();
    this.testDate.setDate(this.testDate.getDate()+4);
    this.testPass2 = new HallPass('testPass2', this.testStudent, this.testIssuer,
                                  new Date(), new Date(), this.testDate,
                                  new Date(), new Date(), this.testOrigin, 
                                  this.testDestination, 'round_trip', '#1893E9,#05B5DE',
                                  'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);
                                  
    this.testDate = new Date();
    this.testDate.setDate(this.testDate.getDate()-1);
    this.testPass3 = new HallPass('testPass3', this.testStudent, this.testIssuer,
                                  new Date(), new Date(), this.testDate,
                                  new Date(), new Date(), this.testOrigin, 
                                  this.testDestination, 'one_way', '#1893E9,#05B5DE',
                                  'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);
    this.testDate = new Date();                              
    this.testDate.setDate(this.testDate.getDate()+1);
    this.testPass4 = new HallPass('testPass4', this.testStudent, this.testIssuer,
                                  new Date(), new Date(), this.testDate,
                                  new Date(), new Date(), this.testOrigin, 
                                  this.testDestination, 'one_way', '#1893E9,#05B5DE',
                                  'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);

    this.testPasses = [this.testPass1, this.testPass2, this.testPass3, this.testPass4];
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
      });
    });
  }

  openReportForm(){
    const dialogRef = this.dialog.open(ReportFormComponent, {
      width: '750px',
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
    });
  }

  onSearch(search: string){
    this.dataService.updateHMSearch(search);
  }

}
