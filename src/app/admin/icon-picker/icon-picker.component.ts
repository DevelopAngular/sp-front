import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { Observable } from 'rxjs';
import {HttpService} from '../../services/http-service';
import {HttpClient} from '@angular/common/http';

export interface Icon {
    id: string;
    inactive_icon: string;
    active: boolean;
    active_icon: string;
}

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss'],
})
export class IconPickerComponent implements OnInit {

  icons$: Observable<Icon[]>;

  @Input() selectedIconPicker;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  public selectedIconId;
  public showSearchInput: boolean;

  constructor(
    private adminService: AdminService,
    private http: HttpService,
  ) { }

  ngOnInit() {
    this.icons$ = this.adminService.getIcons()
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

  openSearchInput() {
    this.showSearchInput = !this.showSearchInput;
  }

  search(search) {
      this.http.searchIcons(search).subscribe(res => {
          console.log(res);
      }, (err) => console.log(err));
}

}
