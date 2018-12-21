import { Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { HttpService } from '../../http-service';
import { map, shareReplay } from 'rxjs/operators';
import { bumpIn } from '../../animations';

@Component({
    selector: 'app-color-pallet-picker',
    templateUrl: './color-pallet-picker.component.html',
    styleUrls: ['./color-pallet-picker.component.scss'],
    animations: [bumpIn]
})
export class ColorPalletPickerComponent implements OnInit {

  colors$;

  @Input() selectedColorProfile;

  @Output() selectedEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('col') pickColor;

  selectedId: number;

  buttonDown = false;
  hovered: boolean = false;

  constructor(private httpService: HttpService, private renderer: Renderer2) { }

  get buttonState() {
     return this.buttonDown ? 'down' : 'up';
  }

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

  onPress(press: boolean) {
    this.buttonDown = press;
  }

  onHover(hover: boolean){
     this.hovered = hover;
     if (!hover) {
      this.buttonDown = false;
     }
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
