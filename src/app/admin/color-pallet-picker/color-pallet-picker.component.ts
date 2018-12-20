import {Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
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

  @ViewChild('col') pickColor;

  selectedId: number;
  activeShadow: number = 20;
  inactiveShadow: number = 0;

  constructor(private httpService: HttpService, private renderer: Renderer2) { }

  ngOnInit() {
      this.colors$ = this.httpService.get('v1/color_profiles').pipe(
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

  overEffect(color, ev) {
    // this.renderer
    //     .setStyle(ev.nativeElement, 'box-shadow',
    //         (this.selectedId === color.id ? '0px 0px 50px ' + color.solid_color : '0 2px 4px 0px rgba(0, 0, 0, 0.1)'));
    // this.selectedId === id ? this.activeShadow += 20 : this.inactiveShadow += 20;
  }

  leaveEffect(id) {
    // this.selectedId === id ? this.activeShadow -= 20 : this.inactiveShadow -= 20;
  }

}
