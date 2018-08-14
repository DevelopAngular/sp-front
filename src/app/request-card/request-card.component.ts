import { Component, OnInit, Input, ElementRef, NgZone } from '@angular/core';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { Inject } from '@angular/core';
import { HttpService } from '../http-service';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { getInnerPassName } from '../pass-tile/pass-display-util';
import { DataService } from '../data-service';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss']
})
export class RequestCardComponent implements OnInit {

  @Input() request: Request;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forInput: boolean = false;
  @Input() forStaff: boolean = false;
  
  selectedDuration: number;
  selectedTravelType: string;
  messageEditOpen: boolean = false;
  dateEditOpen: boolean = false;
  cancelOpen: boolean = false;
  user: User;

  constructor(public dialogRef: MatDialogRef<RequestCardComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpService, public dialog: MatDialog, public dataService: DataService, private _zone: NgZone, private loadingService: LoadingService) { }

  ngOnInit() {
    this.request = this.data['pass'];
    this.forInput = this.data['forInput'];
    this.forFuture = this.data['forFuture'];
    this.fromPast = this.data['fromPast'];
    this.forStaff = this.data['forStaff'];

    this.dataService.currentUser
    .pipe(this.loadingService.watchFirst)
    .subscribe(user => {
      this._zone.run(() => {
        this.user = user;
      });
    });
  }

  get studentName(){
    return getInnerPassName(this.request);
  }

  get teacherName(){
    return this.request.teacher.isSameObject(this.user)?'Me':this.request.teacher.first_name.substr(0, 1) +'. ' +this.request.teacher.last_name;
  }

  get status(){
    return this.request.status.charAt(0).toUpperCase() + this.request.status.slice(1);
  }

  formatDateTime(date: Date){
    return Util.formatDateTime(date);
  }

  newRequest(){
    const endPoint: string = 'api/methacton/v1/pass_requests';
    const body = this.forFuture?{
          'origin' : this.request.origin.id,
          'destination' : this.request.destination.id,
          'attachment_message' : this.request.attachment_message,
          'travel_type' : this.selectedTravelType,
          'teacher' : this.request.teacher.id,
          'request_time' :this.request.request_time.toISOString(),
          'duration' : this.selectedDuration*60,
        }:{
          'origin' : this.request.origin.id,
          'destination' : this.request.destination.id,
          'attachment_message' : this.request.attachment_message,
          'travel_type' : this.selectedTravelType,
          'teacher' : this.request.teacher.id,
          'duration' : this.selectedDuration*60,
        }
    this.http.post(endPoint, body).subscribe((data)=>{
      console.log('[New Request]: ', data);
      this.dialogRef.close();
    });
  }

  changeDate(){
    if(!this.dateEditOpen){
      const dateDialog = this.dialog.open(HallpassFormComponent, {
        width: '750px',
        panelClass: 'form-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'entryState': 'datetime',
              'originalToLocation': this.request.destination,
              'colorProfile': this.request.color_profile,
              'originalFromLocation': this.request.origin}
      });
  
      dateDialog.afterOpen().subscribe( () =>{
        this.dateEditOpen = true;
      });
  
      dateDialog.afterClosed().subscribe(data =>{
        this.request.request_time = data['startTime']?data['startTime']:this.request.request_time;
        this.dateEditOpen = false;

        let endpoint: string = "api/methacton/v1/pass_requests";
        let body: any = {
          'origin' : this.request.origin.id,
          'destination' : this.request.destination.id,
          'attachment_message' : this.request.attachment_message,
          'travel_type' : this.request.travel_type,
          'teacher' : this.request.teacher.id,
          'request_time' :this.request.request_time.toISOString(),
          'duration' : this.request.duration,
        };

        this.http.post(endpoint, body).subscribe(() => {
          this.dialogRef.close();
        });
      });
    }
  }

  editMessage(){
    if(!this.messageEditOpen){
      const infoDialog = this.dialog.open(HallpassFormComponent, {
        width: '750px',
        panelClass: 'form-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'entryState': 'restrictedMessage',
              'originalMessage': this.request.attachment_message,
              'originalToLocation': this.request.destination,
              'colorProfile': this.request.color_profile,
              'originalFromLocation': this.request.origin}
      });
  
      infoDialog.afterOpen().subscribe( () =>{
        this.messageEditOpen = true;
      });
  
      infoDialog.afterClosed().subscribe(data =>{
        this.request.attachment_message = data['message']===''?this.request.attachment_message:data['message'];
        this.messageEditOpen = false;
      });
    }
  }

  cancelRequest(evt: MouseEvent){
    if(!this.cancelOpen){
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      if(this.forStaff){
        options.push(this.genOption('Change Pass Duration & Approve', '#3D396B', 'duration'));
        options.push(this.genOption('Add Message & Deny','#3D396B','denyMessage'));
        options.push(this.genOption('Deny Pass Request','#F00','deny'));
      } else{
        options.push(this.genOption('Delete Pass Request','#F00','delete'));
      }
      const cancelDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'header': 'Are you sure you want to' +(this.forStaff?'deny':'delete') +' this pass request you ' +(this.forStaff?'received':'sent') +'?', 'options': options, 'trigger': target}
      });
  
      cancelDialog.afterOpen().subscribe( () =>{
        this.cancelOpen = true;
      });
  
      cancelDialog.afterClosed().subscribe(action =>{
        this.cancelOpen = false;
        // let shouldDeny = data==null?false:data;
        // if(shouldDeny){
        //   if(this.forInput){
        //     this.dialogRef.close();
        //   } else{
        //     let endpoint: string = 'api/methacton/v1/pass_requests/' +this.request.id +'/cancel';
        //     this.http.post(endpoint).subscribe((data)=>{
        //       console.log('[Request Canceled]: ', data);
        //       this.dialogRef.close();
        //     });
        //   }
        // }
      });
    }
  }

  genOption(display, color, action){
    return {display: display, color: color, action: action}
  }

  approveRequest(){
    let endpoint: string = 'api/methacton/v1/pass_requests/' +this.request.id +'/accept';
    let body = [];
    this.http.post(endpoint, body).subscribe(() =>{
      this.dialogRef.close();
    });
  }
}
