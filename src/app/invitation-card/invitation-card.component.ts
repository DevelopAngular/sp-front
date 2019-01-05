import { Component, OnInit, Input, ElementRef, NgZone } from '@angular/core';
import { Invitation } from '../models/Invitation';
import { User } from '../models/User';
import { Location} from '../models/Location';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Inject } from '@angular/core';
import { HttpService } from '../http-service';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { getInnerPassName } from '../pass-tile/pass-display-util';
import { DataService } from '../data-service';
import { LoadingService } from '../loading.service';
import {HallpassFormComponent} from '../hallpass-form/hallpass-form.component';
import {RequestCardComponent} from '../request-card/request-card.component';
import {PassCardComponent} from '../pass-card/pass-card.component';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.scss']
})
export class InvitationCardComponent implements OnInit {

  @Input() invitation: Invitation;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forStaff: boolean = false;
  @Input() forInput: boolean = false;
  @Input() selectedStudents: User[] = [];

  selectedOrigin: Location;
  denyOpen: boolean = false;
  selectedDuration: number;
  selectedTravelType: string;
  user: User;
  performingAction: boolean;
  fromHistory;
  fromHistoryIndex;

  constructor(
      public dialogRef: MatDialogRef<InvitationCardComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialog: MatDialog, private http: HttpService,
      public dataService: DataService, private _zone: NgZone,
      private loadingService: LoadingService
  ) {}

  get studentName(){
    return getInnerPassName(this.invitation);
  }

  get issuerName(){
    return this.invitation.issuer.isSameObject(this.user)?'Me':this.invitation.issuer.first_name.substr(0, 1) +'. ' +this.invitation.issuer.last_name;
  }

  get status(){
    return this.invitation.status.charAt(0).toUpperCase() + this.invitation.status.slice(1);
  }

  get durationPlural(){
    return this.selectedStudents && this.selectedStudents.length > 1;
  }

  ngOnInit() {
    this.invitation = this.data['pass'];
    this.forFuture = this.data['forFuture'];
    this.fromPast = this.data['fromPast'];
    this.forStaff = this.data['forStaff'];
    this.forInput = this.data['forInput'];
    this.fromHistory = this.data['fromHistory'];
    this.fromHistoryIndex = this.data['fromHistoryIndex'];
    this.selectedStudents = this.data['selectedStudents'];
  if (this.invitation) {
    this.selectedOrigin = this.invitation.default_origin;
  }
    this.dataService.currentUser
    .pipe(this.loadingService.watchFirst)
    .subscribe(user => {
      this._zone.run(() => {
        this.user = user;
      });
    });
  }

  formatDateTime(date: Date){
    return Util.formatDateTime(date);
  }

  setLocation(location: Location){
    this.invitation.default_origin = location;
    this.selectedOrigin = location;
  }

  newInvitation(){
    this.performingAction = true;
    const endPoint:string = 'v1/invitations/bulk_create';

    const body = {
      'students' : this.selectedStudents.map(user => user.id),
      'default_origin' : this.invitation.default_origin?this.invitation.default_origin.id:null,
      'destination' : this.invitation.destination.id,
      'date_choices' : this.invitation.date_choices.map(date => date.toISOString()),
      'duration' : this.selectedDuration*60,
      'travel_type' : this.selectedTravelType
    }

    this.http.post(endPoint, body).subscribe((data)=>{
      this.dialogRef.close();
    });
  }

  acceptInvitation(){
    this.performingAction = true;
    let endpoint: string = 'v1/invitations/' +this.invitation.id +'/accept';
    let body = {
      'start_time' : this.invitation.date_choices[0].toISOString(),
      'origin' : this.selectedOrigin.id
    };

    this.http.post(endpoint, body).subscribe((data: any) => {
      console.log('[Invitation Accepted]: ', data);
      this.dialogRef.close();
    });
  }

  denyInvitation(evt: MouseEvent){
    if(!this.denyOpen){
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';
      if (this.forInput) {
          this.dialogRef.close();
          const isCategory = this.fromHistory[this.fromHistoryIndex] === 'to-category';
          const dialogRef = this.dialog.open(HallpassFormComponent, {
              width: '750px',
              panelClass: 'form-dialog-container',
              backdropClass: 'custom-backdrop',
              data: {
                  'toIcon': isCategory ? this.invitation.icon : null,
                  'toProfile': this.invitation.color_profile,
                  'toCategory': isCategory ? this.invitation.destination.category : null,
                  'fromLocation': this.selectedOrigin,
                  'fromHistory': this.fromHistory,
                  'fromHistoryIndex': this.fromHistoryIndex,
                  'colorProfile': this.invitation.color_profile,
                  'forLater': this.forFuture,
                  'forStaff': this.forStaff,
                  'selectedStudents': this.selectedStudents || true,
                  'requestTime': this.invitation.date_choices[0]
              }
          });
          dialogRef.afterClosed().pipe(filter(res => !!res))
              .subscribe((result: Object) => {
                  this.openInputCard(result['templatePass'],
                      result['forLater'],
                      result['forStaff'],
                      result['selectedStudents'],
                      (result['type'] === 'invitation' ? InvitationCardComponent : RequestCardComponent),
                      result['fromHistory'],
                      result['fromHistoryIndex']
                  );
              });
          return false;
      } else if (!this.forStaff) {
        options.push(this.genOption('Decline Pass Request','#F00','decline'));
        header = 'Are you sure you want to decline this pass request you received?'
      } else {
        options.push(this.genOption('Delete Pass Request','#E32C66','delete'));
        header = "Are you sure you want to delete this pass request you sent?";
      }
      const consentDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'header': header, 'options': options, 'trigger': target}
      });
  
      consentDialog.afterOpen().subscribe( () =>{
        this.denyOpen = true;
      });
  
      consentDialog.afterClosed().subscribe(action =>{
        this.denyOpen = false;
        if(action === 'cancel'){
          this.dialogRef.close();
        } else if(action === 'decline'){
          let endpoint: string = 'v1/invitations/' +this.invitation.id +'/deny';
          let body = {
            'message' : ''
          };
          this.http.post(endpoint, body).subscribe((httpData) => {
            console.log('[Invitation Denied]: ', httpData);
            this.dialogRef.close();
          });
        } else if(action === 'delete'){
          let endpoint: string = 'v1/invitations/' +this.invitation.id +'/cancel';
          let body = {
            'message' : ''
          }
          this.http.post(endpoint, body).subscribe((httpData)=>{
            console.log('[Invitation Cancelled]: ', httpData);
            this.dialogRef.close();
          });
        }});
    }
  }

  genOption(display, color, action){
    return {display: display, color: color, action: action}
  }

    openInputCard(templatePass, forLater, forStaff, selectedStudents, component, fromHistory, fromHistoryIndex) {
        const data = {
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
            panelClass: (forStaff ? 'teacher-' : 'student-') + 'pass-card-dialog-container',
            backdropClass: 'custom-backdrop',
            disableClose: true,
            data: data
        });
    }
}
