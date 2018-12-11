import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpService} from '../../http-service';
import {map, shareReplay} from 'rxjs/operators';

@Component({
    selector: 'app-color-pallet-picker',
    templateUrl: './color-pallet-picker.component.html',
    styleUrls: ['./color-pallet-picker.component.scss']
})
export class ColorPalletPickerComponent implements OnInit {

  colors$;

  @Input() selectedColorProfile;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  selectedId: number;

  constructor(private httpService: HttpService) { }

  ngOnInit() {
      this.colors$ = this.httpService.get('v1/color_profiles').pipe(
          shareReplay(1),
          map((colors: any[]) => {
          return colors.filter(color => color.id !== 1 && color.id !== 6);
      }));
      this.colors$.subscribe(res => console.log('COLORS', res));
      if (this.selectedColorProfile) {
          this.selectedId = this.selectedColorProfile.id;
      }
  }

    changeColor(color) {
        this.selectedId = color.id;
        this.selectedEvent.emit(color);
    }

}
