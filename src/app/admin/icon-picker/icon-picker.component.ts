import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { map } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/http-service';
import { filter } from 'rxjs/internal/operators';

export interface Icon {
    id: string;
    inactive_icon: string;
    active?: boolean;
    active_icon: string;
}

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss'],
})
export class IconPickerComponent implements OnInit {

  @Input() icons$: Observable<Icon[]>;

  @Input() selectedIconPicker;

  icons: Icon[] = [];

  @Input() roomName: string;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  public selectedIconId;
  public showSearchInput: boolean;

  constructor(
    private adminService: AdminService,
    private http: HttpService,
  ) { }

  ngOnInit() {
      this.icons$.pipe(
          map((icons: any) => {
          return this.normalizeIcons(icons);
      })).subscribe(res => this.icons = res);
    //   this.adminService.getIcons()
    //   .pipe(
    //   map((icons: any) => {
    //     return icons.map((_icon) => {
    //         if (this.selectedIconPicker) {
    //             if (this.selectedIconPicker === _icon.inactive_icon) {
    //                 this.selectedIconId = _icon.id;
    //                _icon.active = true;
    //                return _icon;
    //             }
    //         }
    //         _icon.active = false;
    //       return _icon;
    //     });
    //   })
    // ).subscribe(res => this.icons = res);
  }

  normalizeIcons(icons) {
      if (icons) {
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
      } else {
          return [];
      }
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
      if (search === '') {
          search = this.roomName;
      }
      this.http.searchIcons(search).pipe(
          map(icons => this.normalizeIcons(icons))).subscribe(res => {
              this.icons = res;
      });
}

}
