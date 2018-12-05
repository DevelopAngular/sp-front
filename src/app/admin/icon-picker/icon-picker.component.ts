import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpService} from '../../http-service';

//
// class Icon {
//     public state: boolean;
//
//     constructor(private active: string,
//                 private inactive: string) {
//     }
//
//     toggleState() {
//         this.state = !this.state;
//     }
//
//     get Thumbnail(): string {
//         return this.state ? this.active : this.inactive;
//     }
// }

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss']
})
export class IconPickerComponent implements OnInit {

  icons$;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  public selectedIconId;

  constructor(private http: HttpService) { }

  ngOnInit() {
    this.icons$ = this.http.get('v1/room_icons');
  }

  changeIcon(icon) {
    this.selectedIconId = icon.id;
    this.selectedEvent.emit(icon);
  }

}
