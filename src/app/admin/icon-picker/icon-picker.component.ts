import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpService} from '../../http-service';
import {map} from 'rxjs/internal/operators';
import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss']
})
export class IconPickerComponent implements OnInit {

  icons$;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  public selectedIconId;

  constructor(
    private http: HttpService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.icons$ = this.http.get('v1/room_icons')
      .pipe(
      map((icons: any) => {
        return icons.map((_icon) => {
          _icon.active = false;
          return _icon;
        });
      })
    );
  }

  changeIcon(icon) {
    if (icon.active) {
      icon.active = false;
    } else {
      icon.active = true;
    }
    this.selectedIconId = icon.id;
    this.selectedEvent.emit(icon);
  }

}
