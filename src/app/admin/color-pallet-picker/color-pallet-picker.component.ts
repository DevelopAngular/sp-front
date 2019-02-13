import { Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http-service';
import { map, shareReplay } from 'rxjs/operators';
import {AdminService} from '../../services/admin.service';

@Component({
    selector: 'app-color-pallet-picker',
    templateUrl: './color-pallet-picker.component.html',
    styleUrls: ['./color-pallet-picker.component.scss'],
})
export class ColorPalletPickerComponent implements OnInit {

  colors$;

  @Input() selectedColorProfile;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('col') pickColor;

  selectedId: number;

  constructor(private apiService: AdminService) { }

  ngOnInit() {
      this.colors$ = this.apiService.getColors().pipe(
          shareReplay(1),
          map((colors: any[]) => {
          return colors.filter(color => color.id !== 1 && color.id !== 6);
      }));
      if (this.selectedColorProfile) {
          this.selectedId = this.selectedColorProfile.id;
      }
  }

  changeColor(color) {
    this.selectedId = color.id;
    this.selectedEvent.emit(color);
  }

}
