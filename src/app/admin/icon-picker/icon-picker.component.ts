import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {map, tap} from 'rxjs/operators';
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

  public selectedIconLocalUrl: string;

  icons: Icon[] = [];

  isSearching: boolean;

  @Input() roomName: string;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  public selectedIconId;
  public showSearchInput: boolean;
  public iconCollectionTitle: string = 'Search icons';

  constructor(
    private adminService: AdminService,
    private http: HttpService,
  ) { }



  ngOnInit() {

    this.icons$
      .pipe(
        map((icons: any) => {
         return this.normalizeIcons(icons, false);
        }),
      )
      .subscribe(res => {
        console.log(res, this.selectedIconLocalUrl);
        this.icons = res;
          if (!res.length || !this.selectedIconLocalUrl) {
            this.selectedIconLocalUrl = this.selectedIconPicker ? this.selectedIconPicker.replace('FFFFFF', '1F195E') : '';
          }
      });
  }

  normalizeIcons(icons, isSearchInput) {
      if (icons) {
          if (isSearchInput) {
              this.iconCollectionTitle = null;
          } else {
              this.iconCollectionTitle = 'Suggested';
          }
        return icons.map((_icon) => {
              if (this.selectedIconPicker) {
                  if (this.selectedIconPicker === _icon.inactive_icon) {
                      this.selectedIconId = _icon.id;
                      this.selectedIconLocalUrl = _icon.active_icon;
                      _icon.active = true;
                      return _icon;
                  }
              }
              _icon.active = false;
              return _icon;
          });
      } else {
              this.iconCollectionTitle = 'Search icons';
          return [];
      }
  }

  iconTooltipText(icon: Icon) {
    return icon.id.split('_').map((i: string) => {
      if (i) {
        i = i[0].toUpperCase() + i.slice(1);
      } else {
        i = '';
      }
      return i;
    }).join(' ');
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
    console.log(icon);
    this.selectedIconPicker = icon.inactive_icon;
    this.selectedIconLocalUrl = icon.active_icon;
    this.selectedIconId = icon.id;
      this.selectedEvent.emit(icon);
  }

  unselectIcon() {
    this.selectedIconLocalUrl = null;
    this.selectedIconId = null;
  }

  openSearchInput() {
    this.showSearchInput = !this.showSearchInput;
  }

  search(search) {
      let isSearch: boolean = true;
      if (search === '') {
          search = this.roomName;
          isSearch = false;
      }

      this.http.searchIcons(search).pipe(
          map(icons => this.normalizeIcons(icons, isSearch))).subscribe((res: any[]) => {
              if (!res.length) {
                  this.iconCollectionTitle = 'No results';
              }
              this.icons = res;
      });
  }

}
