import { Component, EventEmitter, Input, OnInit, Output, ElementRef, NgZone, OnDestroy } from '@angular/core';
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
export class PassCardComponent implements OnInit, OnDestroy {

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

  timers: number[] = [];

  p1Title; p1Subtitle; p1Stamp;
  p2Title; p2Subtitle; p2Stamp;
  p3Title; p3Subtitle; p3Stamp;
  p4Title; p4Subtitle; p4Stamp;

  user: User;
  activePage;

  performingAction: boolean;

  constructor(public dialogRef: MatDialogRef<PassCardComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpService, public dialog: MatDialog, public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService) {

  }

  getUserName(user: User){
    return user.isSameObject(this.user)?'Me':user.first_name.substr(0, 1) +'. ' +user.last_name;
  }

  get startTime(){
    let s:Date = this.pass['start_time'];
    return Util.formatDateTime(s);
  }

  get hasClose(){
    if(this.forInput){
      return true;
    } else if(this.forMonitor){
      return !this.fromPast;
    } else if(this.forStaff){
      return this.forFuture || this.isActive;
    } else{
      if(this.forFuture && this.pass.issuer.isSameObject(this.user)){
        return true;
      } else{
        return this.isActive;
      }
    }

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
    if (!!this.pass && this.isActive) {
      console.log('Starting interval');
      this.timers.push(window.setInterval(() => {
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
      }, 750));
    }
  }

  ngOnDestroy() {
    this.timers.forEach(id => {
      console.log('Clearing interval');
      clearInterval(id);
    });
    this.timers = [];
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
      this.buildPage('Pass Request Sent', 'by ' +this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.flow_start), (this.pagerPages+1));
      this.buildPage('Pass Request Accepted', 'by ' +this.getUserName(this.pass.student), this.formatDateTime(this.pass.created), (this.pagerPages+1));
    } else if(this.pass.parent_request){
      this.buildPage('Pass Request Sent', 'by ' +this.getUserName(this.pass.student), this.formatDateTime(this.pass.flow_start), (this.pagerPages+1));
      this.buildPage('Pass Request Accepted', 'by ' +this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), (this.pagerPages+1));
    } else if(this.forFuture){
      this.buildPage('Pass Sent', 'by ' +this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), (this.pagerPages+1));
    } else if(!this.pass.issuer.roles.includes('hallpass_student')){
      this.buildPage('Pass Created', 'by ' +this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), (this.pagerPages+1));
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
    this.performingAction = true;
    const endPoint:string = 'v1/hall_passes' +(this.forStaff?'/bulk_create':'')

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
    if(!this.cancelOpen){
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';

      if((this.isActive && this.forStaff) || this.forMonitor){
        options.push(this.genOption('Report Student','#3D396B','report'));
        options.push(this.genOption('End Pass','#E32C66','end'));
        header = 'What would you like to do with this pass?';
      } else{
        if(this.forInput){
          options.push(this.genOption('Stop making pass','#E32C66','stop'));
          header = 'Are you sure you want to stop making this pass?';
        } else if(this.forFuture){
          options.push(this.genOption('Delete Scheduled Pass','#E32C66','delete'));
          header = 'Are you sure you want to delete this scheduled pass?';
        }
      }

      const cancelDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'header': header, 'options': options, 'trigger': target}
      });

      cancelDialog.afterOpen().subscribe( () =>{
        this.cancelOpen = true;
      });

      cancelDialog.afterClosed().subscribe(action =>{
        this.cancelOpen = false;
        if(action === 'stop'){
          this.dialogRef.close();
        } else if(action === 'delete'){
          let endpoint: string = 'v1/hall_passes/' +this.pass.id +'/cancel';
          let body = {};
          this.http.post(endpoint, body).subscribe((httpData)=>{
            console.log('[Future Pass Cancelled]: ', httpData);
            this.dialogRef.close();
          });
        } else if(action === 'report'){
          this.dialogRef.close({'report':this.pass.student});
        } else if(action === 'end'){
          const endPoint:string = 'v1/hall_passes/' +this.pass.id +'/ended';
          this.http.post(endPoint).subscribe(()=>{this.dialogRef.close();});
        }
      });
    }
  }

  genOption(display, color, action){
    return {display: display, color: color, action: action}
  }
}
