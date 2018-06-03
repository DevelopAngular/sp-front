import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { HttpService } from '../http-service';
import { Request } from '../NewModels';
import { RequestAcceptComponent } from '../request-accept/request-accept.component';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.css']
})
export class RequestCardComponent implements OnInit {

  @Input()
  request: Request;

  @Input()
  forTeacher = false;

  @Output() onAccept: EventEmitter<any> = new EventEmitter();

  weekday: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  month: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  constructor(public dialog: MatDialog, private http: HttpService) {
  }

  ngOnInit() {
  }

  getGradient() {
    const gradient: string[] = this.request.gradient_color.split(',');
    return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
    // return "radial-gradient(circle at 73% 71%, #AA11FF, #FF11AA)";
  }

  getDate(s: Date) {
    s = new Date(s);
    return this.weekday[s.getDay()] + ' ' + this.month[s.getMonth()] + ' ' + (s.getDate());
  }

  getTime(s: Date) {
    s = new Date(s);
    return ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' +
      ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? 'pm' : 'am');
  }

  acceptRequest() {
    const dialogRef = this.dialog.open(RequestAcceptComponent, {
      width: '750px',
      hasBackdrop: true,
      data: {message: this.request.attachment_message}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        let body = {};
        if (result['date'] == '') {
          body = {
            'duration': result['duration'].value
          };
        } else {
          body = {
            'start_time': result['date'],
            'duration': result['duration'].value
          };
        }

        this.http.post('api/methacton/v1/pass_requests/' + this.request.id + '/accept', body).subscribe(() => {
          this.onAccept.emit(result['date'] == '');
        });
      }
    });
  }

  cancelRequest(event) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConsentMenuComponent, {
      width: '250px',
      hasBackdrop: true,
      data: {content: 'Are you sure you want to cancel this request?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post('api/methacton/v1/pass_requests/' + this.request.id + '/deny', '').subscribe(() => {
          this.onAccept.emit();
        });
      }
    });
  }

}
