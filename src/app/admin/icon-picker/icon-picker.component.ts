import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpService} from '../../http-service';
import {map, shareReplay} from 'rxjs/internal/operators';
import {DomSanitizer} from '@angular/platform-browser';
import * as _ from 'lodash';


@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss']
})
export class IconPickerComponent implements OnInit {

  icons$;

  @Input() selectedIconPicker;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  public selectedIconId;

  constructor(
    private http: HttpService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.icons$ = this.http.get('v1/room_icons')
      .pipe(shareReplay(1),
      map((icons: any) => {
        return icons.map((_icon) => {
            if (this.selectedIconPicker) {
                if (this.selectedIconPicker === _icon.inactive_icon) {
                    this.selectedIconId = _icon.id;
                   _icon.active = true;
                   return _icon;
                }
            }
            _icon.active = false;
          return _icon;
        });
      })
    );
  }

  changeIcon(icon) {
      if (this.selectedIconId === icon.id) {
          return;
      }
      if ( this.selectedIconId !== icon.id && icon.active) {
          icon.active = false;
      }
      if (icon.active) {
          icon.active = false;
      } else {
          icon.active = true;
      }
      this.selectedIconId = icon.id;
      this.selectedEvent.emit(icon);
  }

}
