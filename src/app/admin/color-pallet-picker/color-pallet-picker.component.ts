import { Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http-service';
import {finalize, map, share, shareReplay, switchMap} from 'rxjs/operators';
import {AdminService} from '../../services/admin.service';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-color-pallet-picker',
    templateUrl: './color-pallet-picker.component.html',
    styleUrls: ['./color-pallet-picker.component.scss'],
})
export class ColorPalletPickerComponent implements OnInit {

  @Input() selectedColorProfile;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('col') pickColor;

  selectedId: number;
  colors$;
  loading$: Observable<boolean>;
  loaded$: Observable<boolean>;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
      this.loading$ = this.adminService.loadingColorProfiles$;
      this.loaded$ = this.adminService.loadedColorProfiles$;
      this.colors$ = this.loaded$.pipe(
          share(),
          switchMap(loaded => {
            if (loaded) {
              return this.adminService.colorProfiles$;
            } else {
              return this.adminService.getColorsRequest();
            }
          }),
          map((colors: any[]) => {
            return colors.filter(color => color.id !== 1 && color.id !== 6);
          })
      );
      if (this.selectedColorProfile) {
          this.selectedId = this.selectedColorProfile.id;
      }
  }

  changeColor(color) {
    this.selectedId = color.id;
    this.selectedEvent.emit(color);
  }

}
