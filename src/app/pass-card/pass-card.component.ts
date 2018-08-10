import { Component, EventEmitter, Input, OnInit, Output, ElementRef, NgZone } from '@angular/core';
import { User } from '../models/User';
import { HallPass} from '../models/HallPass';
import { Util } from '../../Util';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { HttpService } from '../http-service';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { DataService } from '../data-service';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-pass-card',
  templateUrl: './pass-card.component.html',
  styleUrls: ['./pass-card.component.scss']
})
export class PassCardComponent implements OnInit {

  @Input() pass: HallPass;
  @Input() forInput: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;
  @Input() isActive: boolean = false;
  @Input() forStaff: boolean = false;
  @Input() forMonitor: boolean = false;
  @Output() cardEvent: EventEmitter<any> = new EventEmitter();

  timeLeft: string = '';
  valid: boolean = true;
  returnData: any = {};
  overlayWidth: number = 0;
  buttonWidth: number = 181;

  selectedDuration: number;
  selectedTravelType: string;
  cancelOpen: boolean = false;
  selectedStudents: User[];

  pagerPages = 0;

  p1Title; p1Subtitle; p1Stamp;
  p2Title; p2Subtitle; p2Stamp;
  p3Title; p3Subtitle; p3Stamp;
  p4Title; p4Subtitle; p4Stamp;

  user: User;
  activePage;

  constructor(public dialogRef: MatDialogRef<PassCardComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpService, public dialog: MatDialog, public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService) {

  }

  getUserName(user: User){
    return user.isSameObject(this.user)?'Me':user.first_name.substr(0, 1) +'. ' +user.last_name;
  }

  get startTime(){
    let s:Date = this.pass['start_time'];
    return Util.formatDateTime(s);
  }

  ngOnInit() {
    this.pass = this.data['pass'];
    this.forInput = this.data['forInput'];
    this.isActive = this.data['isActive'];
    this.forFuture = this.data['forFuture'];
    this.fromPast = this.data['fromPast'];
    this.forStaff = this.data['forStaff'];
    this.selectedStudents = this.data['selectedStudents'];
    this.forMonitor = this.data['forMonitor'];

    this.dataService.currentUser
        .pipe(this.loadingService.watchFirst)
        .subscribe(user => {
          this._zone.run(() => {
            this.user = user;
            this.buildPages();
          });
        });

    setInterval(() => {
      if (!!this.pass && this.isActive) {
        let end: Date = this.pass.expiration_time;
        let now: Date = new Date();
        let diff: number = (end.getTime() - now.getTime()) / 1000;
        let mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
        let secs: number = Math.abs(Math.floor(diff) % 60);
        this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
        this.valid = end > now;

        let start: Date = this.pass.start_time;
        let dur: number = Math.floor((end.getTime() - start.getTime()) / 1000);
        this.overlayWidth = (this.buttonWidth * (diff/dur));
      }
    }, 10);
  }

  updateDuration(dur:number){
    this.returnData['duration'] = dur;
  }

  updateTravelType(travelType:string){
    this.pass.travel_type = travelType;
  }

  formatDateTime(date: Date){
    return Util.formatDateTime(date);
  }

  getDuration(){
    let start: Date = this.pass.start_time;
    let end: Date = this.pass.end_time;
    let timeDiff = Math.abs(start.getTime() - end.getTime());
    let diffSecs = Math.ceil(timeDiff / 1000);
    return Math.floor(diffSecs/60) +':' +(diffSecs%60<10?'0':'') +diffSecs%60;
  }

  buildPages(){
    if(this.pass.parent_invitation){
      this.buildPage('Pass Request Sent', 'by ' +this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.flow_start), 1);
      this.buildPage('Pass Request Accepted', 'by ' +this.getUserName(this.pass.student), this.formatDateTime(this.pass.created), 2);
    } else if(this.pass.parent_request){
      this.buildPage('Pass Request Sent', 'by ' +this.getUserName(this.pass.student), this.formatDateTime(this.pass.flow_start), 1);
      this.buildPage('Pass Request Accepted', 'by ' +this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), 2);
    } else if(this.forFuture){
      this.buildPage('Pass Sent', 'by ' +this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), 1);
    }

    if(this.isActive){
      this.buildPage('Pass Started', '', this.formatDateTime(this.pass.created), (this.pagerPages+1));
      this.activePage = (this.pagerPages);
    } else if(this.fromPast){
      this.buildPage('Pass Started', '', this.formatDateTime(this.pass.created), (this.pagerPages+1));
      let start: Date = this.pass.start_time;
      let end: Date = this.pass.end_time;
      let diff: number = (end.getTime() - start.getTime()) / 1000;
      let mins: number = Math.floor(Math.floor(diff) / 60);
      let secs: number = Math.abs(Math.floor(diff) % 60);
      let totalTime = mins + ':' + (secs < 10 ? '0' + secs : secs);
      this.buildPage('Pass Ended', '', totalTime +" - Total Time", (this.pagerPages+1));
    }
  }

  buildPage(title: string, subtitle: string, stamp: string, page: number){
    if(page === 1){
      this.p1Title = title;
      this.p1Subtitle = subtitle;
      this.p1Stamp = stamp;
    } else if(page === 2){
      this.p2Title = title;
      this.p2Subtitle = subtitle;
      this.p2Stamp = stamp;
    } else if(page === 3){
      this.p3Title = title;
      this.p3Subtitle = subtitle;
      this.p3Stamp = stamp;
    } else if(page === 4){
      this.p4Title = title;
      this.p4Subtitle = subtitle;
      this.p4Stamp = stamp;
    }
    this.pagerPages++;
  }

  newPass(){
    const endPoint:string = 'api/methacton/v1/hall_passes' +(this.forStaff?'/bulk_create':'')

    const body = {
      'duration' : this.selectedDuration*60,
      'origin' : this.pass.origin.id,
      'destination' : this.pass.destination.id,
      'travel_type' : this.selectedTravelType
    }
    
    if(this.forStaff){
      body['students'] = this.selectedStudents.map(user => user.id);
    } else {
      body['student'] = this.pass.student.id;
    }

    if(this.forFuture)
      body['start_time'] = this.pass.start_time.toISOString();

    this.http.post(endPoint, body).subscribe((data)=>{
      this.dialogRef.close();
    });
  }
  
  cancelEdit(evt: MouseEvent){
    if(this.forMonitor){
      this.dialogRef.close({'report':this.pass.student});
    } else{
      if(!this.cancelOpen && this.forInput){
        const target = new ElementRef(evt.currentTarget);
        const cancelDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: {'header': 'Are you sure you want to cancel this pass?', 'confirm': 'Cancel', 'deny': 'Close', 'trigger': target}
        });
    
        cancelDialog.afterOpen().subscribe( () =>{
          this.cancelOpen = true;
        });
    
        cancelDialog.afterClosed().subscribe(data =>{
          this.cancelOpen = false;
          if(data==null?false:data)
            this.dialogRef.close();
        });
      }
    }
  }

}
