import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HallPass} from '../models/HallPass';
import {Invitation} from '../models/Invitation';
import {Request} from '../models/Request';
import {MatDialog} from '@angular/material/dialog';
import {filter} from 'rxjs/operators';
import {HttpService} from '../services/http-service';
import {ScreenService} from '../services/screen.service';

@Component({
  selector: 'app-travel-view',
  templateUrl: './travel-view.component.html',
  styleUrls: ['./travel-view.component.scss']
})

export class TravelViewComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;
  @Input() shrink: boolean = false;
  @Input() forStaff: boolean = false;
  @Input() height: string = '217px';

  @Output() locationSelected: EventEmitter<any> = new EventEmitter();

  type: string;
  showRoomNumber: boolean;

  constructor(
      public dialog: MatDialog,
      private http: HttpService,
      public screenService: ScreenService
  ) { }

  get originRoomName() {
    if (this.showRoomNumber) {
      if (this.pass instanceof Invitation) {
          return this.pass.default_origin ? this.pass.default_origin.title + `${this.pass.default_origin.room}` : 'Origin';
      } else {
        return this.pass.origin.title + ` (${this.pass.origin.room})`;
      }
    } else {
      if (this.pass instanceof Invitation) {
        return this.pass.default_origin ? this.pass.default_origin.title : 'Origin';
      } else {
        return this.pass.origin.title;
      }
    }
  }

  get destinationRoomName() {
     return this.showRoomNumber ? this.pass.destination.title + ` (${this.pass.destination.room})` : this.pass.destination.title;
  }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
    (this.pass instanceof Invitation) ? 'invitation' :
      'request';
    this.http.currentSchool$.pipe(filter(res => !!res)).subscribe(res => {
      this.showRoomNumber = res.display_card_room;
    });
  }

}
