import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Invitation, Location } from '../NewModels';
import { HttpService } from '../http-service';
import { LocationChooseComponent } from '../location-choose/location-choose.component';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { MatDialog, MatDialogConfig } from '@angular/material';
@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.css']
})
export class InvitationCardComponent implements OnInit {

  @Input()
  invitation:Invitation;

  @Output()
  onSelect:EventEmitter<any> = new EventEmitter();

  weekday = ["Sundy"];
  month = [];

  selectedDate: Date;

  origin: Location;

  constructor(private http:HttpService, public dialog: MatDialog) { }

  ngOnInit() {
    this.weekday[0] = "Sunday";
    this.weekday[1] = "Monday";
    this.weekday[2] = "Tuesday";
    this.weekday[3] = "Wednesday";
    this.weekday[4] = "Thursday";
    this.weekday[5] = "Friday";
    this.weekday[6] = "Saturday";

    this.month[0] = "January";
    this.month[1] = "February";
    this.month[2] = "March";
    this.month[3] = "April";
    this.month[4] = "May";
    this.month[5] = "June";
    this.month[6] = "July";
    this.month[7] = "August";
    this.month[8] = "September";
    this.month[9] = "October";
    this.month[10] = "November";
    this.month[11] = "December";

    this.origin = this.invitation.default_origin;
  }

  getGradient(){
    let gradient: string[] = this.invitation.gradient_color.split(",");;

    return "radial-gradient(circle at 73% 71%, " +gradient[0] +", " +gradient[1] +")";
    // return "radial-gradient(circle at 73% 71%, #567890, #235678)";
  }

  getDate(s:Date){
    s = new Date(s);
    return this.weekday[s.getDay()] +' ' + this.month[s.getMonth()] + ' ' + (s.getDate());
  }

  getTime(s:Date){
    s = new Date(s);
    return ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
  }

  activateInvitation(){
    this.selectedDate = this.invitation.date_choices[0];
    if(!!this.invitation.default_origin){
      let dialogRef = this.dialog.open(ConsentMenuComponent, {
        width: '250px',
        hasBackdrop: true,
        data: { content: 'Are you in ' +this.invitation.default_origin.title +'(' +this.invitation.default_origin.room +')'}
      });
      
      dialogRef.afterClosed().subscribe(result => {
        this.atDefault(result);
      });
    } else{
      this.atDefault(false);
    }
  }

  atDefault(isAtDefault: boolean){
    if(isAtDefault){
      this.acceptInvitation();
    } else{
      let dialogRef = this.dialog.open(LocationChooseComponent, {
        width: '250px',
        hasBackdrop: true
      });
      
      dialogRef.afterClosed().subscribe(result => {
        this.origin = result;
        this.acceptInvitation();
      });
    }
  }

  selectOrigin(loc:Location){
    this.origin = loc;
  }

  acceptInvitation(){
    this.http.post('api/methacton/v1/invitations/' +this.invitation.id +'/accept', "", {"":""});
    this.onSelect.emit();
  }

}
