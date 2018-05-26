import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { HttpService } from '../http-service';
import { LocationChooseComponent } from '../location-choose/location-choose.component';
import { Invitation, Location, User } from '../NewModels';

@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.css']
})
export class InvitationCardComponent implements OnInit {

  @Input()
  invitation: Invitation;

  @Input()
  user: User;

  @Output()
  onAccept: EventEmitter<any> = new EventEmitter();

  weekday: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  month: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  selectedDate: Date;

  origin: Location;

  constructor(private http: HttpService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.origin = this.invitation.default_origin;
  }

  getGradient() {
    const gradient: string[] = this.invitation.gradient_color.split(',');

    return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
    // return "radial-gradient(circle at 73% 71%, #567890, #235678)";
  }

  getDate(s: Date) {
    s = new Date(s);
    return this.weekday[s.getDay()] + ' ' + this.month[s.getMonth()] + ' ' + (s.getDate());
  }

  getTime(s: Date) {
    s = new Date(s);
    
    let hrs = ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours());
    hrs = (hrs==0)?12:hrs;

    let mins = ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? 'pm' : 'am');
    return hrs + ':' +mins
      
  }

  activateInvitation() {
    this.selectedDate = this.invitation.date_choices[0];
    if (!!this.invitation.default_origin) {
      const dialogRef = this.dialog.open(ConsentMenuComponent, {
        width: '250px',
        hasBackdrop: true,
        data: {content: 'Are you in ' + this.invitation.default_origin.title + '(' + this.invitation.default_origin.room + ')'}
      });

      dialogRef.afterClosed().subscribe(result => {
        this.atDefault(result);
      });
    } else {
      this.atDefault(false);
    }
  }

  atDefault(isAtDefault: boolean) {
    if (isAtDefault) {
      this.acceptInvitation();
    } else {
      const dialogRef = this.dialog.open(LocationChooseComponent, {
        width: '250px',
        hasBackdrop: true
      });

      dialogRef.afterClosed().subscribe(result => {
        this.origin = result;
        this.acceptInvitation();
      });
    }
  }

  selectOrigin(loc: Location) {
    this.origin = loc;
  }

  acceptInvitation() {
    const body = {
      'start_time': this.selectedDate.toISOString(),
      'origin': this.origin.id
    };
    this.http.post('api/methacton/v1/invitations/' + this.invitation.id + '/accept', body).subscribe(() => {
      this.onAccept.emit();
    });
  }

  cancelInvitation(event) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConsentMenuComponent, {
      width: '250px',
      hasBackdrop: true,
      data: {content: 'Are you sure you want to cancel this invitation?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post('api/methacton/v1/invitations/' + this.invitation.id + '/deny', '').subscribe(() => {
          this.onAccept.emit();
        });
      }
    });
  }

}
