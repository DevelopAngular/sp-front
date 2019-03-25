import { Component, EventEmitter, Input, OnInit, Output, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { User } from '../models/User';
import { HallPass} from '../models/HallPass';
import { Util } from '../../Util';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { DataService } from '../services/data-service';
import { LoadingService } from '../services/loading.service';
import { Navigation } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import {filter, map} from 'rxjs/operators';
import {RequestCardComponent} from '../request-card/request-card.component';
import {InvitationCardComponent} from '../invitation-card/invitation-card.component';
import {BehaviorSubject, interval, merge, of, Subscription} from 'rxjs';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms/create-hallpass-forms.component';
import {HallPassesService} from '../services/hall-passes.service';
import { TimeService } from '../services/time.service';

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
  @Input() formState: Navigation;
  @Input() students: User[] = [];

  @Output() cardEvent: EventEmitter<any> = new EventEmitter();

  timeLeft: string = '';
  valid: boolean = true;
  returnData: any = {};
  overlayWidth: number = 0;
  buttonWidth: number = 288;

  selectedDuration: number;
  selectedTravelType: string;
  cancelOpen: boolean = false;
  selectedStudents: User[] = [];
  fromHistory;
  fromHistoryIndex;

  pagerPages = 0;

  timers: number[] = [];

  p1Title; p1Subtitle; p1Stamp;
  p2Title; p2Subtitle; p2Stamp;
  p3Title; p3Subtitle; p3Stamp;
  p4Title; p4Subtitle; p4Stamp;

  user: User;
  activePage;

  performingAction: boolean;
  isModal: boolean;

  isSeen: boolean;

  subscribers$: Subscription;

  constructor(
      public dialogRef: MatDialogRef<PassCardComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private hallPassService: HallPassesService,
      public dialog: MatDialog,
      public dataService: DataService,
      private _zone: NgZone,
      private loadingService: LoadingService,
      private createFormService: CreateFormService,
      private timeService: TimeService,
  ) {}

  getUserName(user: any) {
    if (user instanceof User) {
      return user.isSameObject(this.user)?'Me':user.first_name.substr(0, 1) +'. ' +user.last_name;
    } else {
      return user.first_name.substr(0, 1) +'. ' +user.last_name;
    }
  }

  get gradient() {
      return 'radial-gradient(circle at 73% 71%, ' + this.pass.color_profile.gradient_color + ')';
  }

  get studentText() {
    return (this.selectedStudents ?
        (this.selectedStudents.length > 2 ?
            this.selectedStudents[0].display_name + ' and ' + (this.selectedStudents.length - 1) + ' more' :
            this.selectedStudents[0].display_name + (this.selectedStudents.length > 1 ?
            ' and ' + this.selectedStudents[1].display_name : '')) : this.pass.student.display_name + ` (${this.studentEmail})`);
  }

  get studentEmail() {
    return this.pass.student.primary_email.split('@', 1)[0];
  }

  get startTime(){
    let s:Date = this.pass['start_time'];
    return Util.formatDateTime(s);
  }

  get closeIcon(){
    if(((this.isActive && this.forStaff) || this.forMonitor)){
      return './assets/Three dots (Transparent).png';
    } else{
      return './assets/'+(this.forInput?'Back Button ': 'Trash ') + '(Transparent).png';
    }
  }

  get hasClose(){
    return (this.forInput || this.forStaff || this.pass.cancellable_by_student) && !this.fromPast;
    // if(this.forInput) {
    //   return true;
    // } else if (this.forMonitor) {
    //   return !this.fromPast;
    // } else if (this.forStaff) {
    //   return this.forFuture || this.isActive;
    // }
    // else if ( this.user.id === this.pass.student.id && this.forFuture) {
    //   return this.pass.cancellable_by_student;
    // }
    // else if (!this.forStaff && this.forFuture){
    //   return false;
    // } else {
    //   return this.forFuture;
    // }
  }

  ngOnInit() {
    if (this.data['pass']) {
      this.isModal = true;
      this.pass = this.data['pass'];
      this.forInput = this.data['forInput'];
      this.isActive = this.data['isActive'];
      this.forFuture = this.data['forFuture'];
      this.fromPast = this.data['fromPast'];
      this.forStaff = this.data['forStaff'];
      this.selectedStudents = this.data['selectedStudents'];
      this.forMonitor = this.data['forMonitor'];
      this.fromHistory = this.data['fromHistory'];
      this.fromHistoryIndex = this.data['fromHistoryIndex'];
    } else {
      this.selectedStudents = this.students;
    }

      this.dataService.currentUser
        .pipe(this.loadingService.watchFirst)
        .subscribe(user => {
          this._zone.run(() => {
            this.user = user;
            this.buildPages();
          });
        });
    console.log('[Trashcan]: ', 'this.forInput('+this.forInput +') || (this.pass.cancellable_by_student('+this.pass.cancellable_by_student +') == (this.forStaff('+!this.forStaff +'))', '=', this.forInput || (this.pass.cancellable_by_student && !this.forStaff));
    if (!!this.pass && this.isActive) {
      console.log('Starting interval');
      merge(of(0), interval(1000)).pipe(map(x => {
        const end: Date = this.pass.expiration_time;
        const now: Date = this.timeService.nowDate();
        const diff: number = (end.getTime() - now.getTime()) / 1000;
        const mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
        const secs: number = Math.abs(Math.floor(diff) % 60);
        this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
        this.valid = end > now;

        const start: Date = this.pass.start_time;
        const dur: number = Math.floor((end.getTime() - start.getTime()) / 1000);
        this.overlayWidth = (this.buttonWidth * (diff / dur));
        return x;
      })).subscribe();
    }
    this.createFormService.isSeen$.subscribe(res => this.isSeen = res);
  }

  ngOnDestroy() {

  }

  updateDuration(dur:number){
    this.returnData['duration'] = dur;
  }

  updateTravelType(travelType:string){
    this.pass.travel_type = travelType;
  }

  formatDateTime(date: Date){
    date = new Date(date);
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
    } else if(this.forFuture && this.pass.issuer ) {
       this.buildPage('Pass Created', 'by ' +this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), (this.pagerPages+1));
    } else if (this.pass.issuer) {
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

  newPass() {
    this.performingAction = true;
    const body = {
      'duration' : this.selectedDuration * 60,
      'origin' : this.pass.origin.id,
      'destination' : this.pass.destination.id,
      'travel_type' : this.selectedTravelType
    };
    if (this.forStaff) {
      body['students'] = this.selectedStudents.map(user => user.id);
    } else {
      body['student'] = this.pass.student.id;
    }

    if (this.forFuture) {
        body['start_time'] = this.pass.start_time.toISOString();
    }
     const getRequest$ = this.forStaff ? this.hallPassService.bulkCreatePass(body) : this.hallPassService.createPass(body);
      getRequest$.subscribe((data) => {
        this.performingAction = true;
        this.dialogRef.close();
      });
  }

  cancelEdit(evt: MouseEvent){
    if(!this.cancelOpen){
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';

      if((this.isActive && this.forStaff) || this.forMonitor){

        if (this.user.isTeacher()) {
          options.push(this.genOption('Report Student', '#E32C66', 'report'));
        }
        options.push(this.genOption('End Pass', '#E32C66', 'end'));
        // header = 'What would you like to do with this pass?';
        header = '';
      } else{
        if (this.forInput) {
          if (this.isSeen) {

            this.formState.step = 3;
              this.formState.previousStep = 4;
              this.cardEvent.emit(this.formState);
          } else {
            this.dialogRef.close();
            const isCategory = this.fromHistory[this.fromHistoryIndex] === 'to-category';
            const dialogRef = this.dialog.open(CreateHallpassFormsComponent, {
                width: '750px',
                panelClass: 'form-dialog-container',
                backdropClass: 'custom-backdrop',
                data: {
                    'toIcon': isCategory ? this.pass.icon : null,
                    'toProfile': this.pass.color_profile,
                    'toCategory': isCategory ? this.pass.destination.category : null,
                    'fromLocation': this.pass.origin,
                    'fromHistory': this.fromHistory,
                    'fromHistoryIndex': this.fromHistoryIndex,
                    'colorProfile': this.pass.color_profile,
                    'forLater': this.forFuture,
                    'forStaff': this.forStaff,
                    'selectedStudents': this.selectedStudents,
                    'requestTime': this.pass.start_time
                }
            });
            dialogRef.afterClosed().pipe(filter(res => !!res)).subscribe((result: Object) => {
                    this.openInputCard(result['templatePass'],
                        result['forLater'],
                        result['forStaff'],
                        result['selectedStudents'],
                        (result['type'] === 'hallpass' ? PassCardComponent : (result['type'] === 'request' ? RequestCardComponent : InvitationCardComponent)),
                        result['fromHistory'],
                        result['fromHistoryIndex']
                    );
                });
          }
            return false;
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

      cancelDialog.afterOpen().subscribe( () => {
        this.cancelOpen = true;
      });

      cancelDialog.afterClosed().subscribe(action => {
          this.cancelOpen = false;
      if(action === 'delete'){
          let body = {};
          this.hallPassService.cancelPass(this.pass.id, body).subscribe((httpData) => {
            console.log('[Future Pass Cancelled]: ', httpData);
            this.dialogRef.close();
          });
        } else if(action === 'report') {
          this.dialogRef.close({'report': this.pass.student });
        } else if(action === 'end') {
          this.hallPassService.endPass(this.pass.id).subscribe(() => {
            this.dialogRef.close();
          });
        }
      });
    }
  }

  genOption(display, color, action){
    return {display: display, color: color, action: action}
  }


    openInputCard(templatePass, forLater, forStaff, selectedStudents, component, fromHistory, fromHistoryIndex) {
        let data = {
            'pass': templatePass,
            'fromPast': false,
            'fromHistory': fromHistory,
            'fromHistoryIndex': fromHistoryIndex,
            'forFuture': forLater,
            'forInput': true,
            'forStaff': forStaff,
            'selectedStudents': selectedStudents,
        };
        this.dialog.open(component, {
            panelClass: (this.forStaff ? 'teacher-' : 'student-') + 'pass-card-dialog-container',
            backdropClass: 'custom-backdrop',
            disableClose: true,
            data: data
        });
    }
}
