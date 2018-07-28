import { Component, OnInit, NgZone } from '@angular/core';
import { User, Location, ColorProfile, HallPass } from '../NewModels';
import { DataService } from '../data-service';
import { LoadingService } from '../loading.service';
import { Util } from '../../Util';
@Component({
  selector: 'app-my-room',
  templateUrl: './my-room.component.html',
  styleUrls: ['./my-room.component.scss']
})
export class MyRoomComponent implements OnInit {

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
  calendarToggled: boolean = false;
  user: User;
  isStaff: boolean= false;
  min: Date = new Date('December 17, 1995 03:24:00');
  _searchDate: Date = new Date();

  constructor(private dataService: DataService, private _zone: NgZone, private loadingService: LoadingService) {
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

  set searchDate(date: Date){
    this._searchDate = date;
    date.setHours(0);
    date.setMinutes(0);
    this.dataService.updateMRDate(date);
  }

  get dateDisplay(){
    return Util.formatDateTime(this._searchDate).split(',')[0];
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

  onSearch(search: string){
    this.dataService.updateMRSearch(search);
  }
}
