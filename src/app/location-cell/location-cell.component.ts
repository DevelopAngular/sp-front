import {Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import { Location } from '../models/Location';
import { HttpService } from '../services/http-service';
import { DomSanitizer } from '@angular/platform-browser';
import {ScreenService} from '../services/screen.service';
import {DeviceDetection} from '../device-detection.helper';
import {School} from '../models/School';
import {TooltipDataService} from '../services/tooltip-data.service';
import {PassLimit} from '../models/PassLimit';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'app-location-cell',
  templateUrl: './location-cell.component.html',
  styleUrls: ['./location-cell.component.scss']
})
export class LocationCellComponent implements OnInit {

  @Input()
  value: Location;

  @Input()
  type: string;

  @Input()
  starred: boolean;

  @Input()
  showStar: boolean;

  @Input()
  forStaff: boolean;

  @Input()
  forLater: boolean;

  @Input()
  hasLocks: boolean = false;

  @Input()
  valid: boolean = true;

  @Input()
  allowOnStar: boolean = false;

  @Input() currentPage: 'from' | 'to';

  @Input() passLimit: PassLimit;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<any> = new EventEmitter();

  @ViewChild('cell') cell: ElementRef;

  currentSchool: School;

  showTooltipWithDelay: boolean;

  overStar: boolean = false;
  hovered: boolean;
  pressed: boolean;
  intervalId;

  constructor(
    private http: HttpService,
    private sanitizer: DomSanitizer,
    public screen: ScreenService,
    private renderer: Renderer2,
    private tooltipService: TooltipDataService,
  ) {
    this.currentSchool = this.http.getSchool();
  }

  get showLock() {
    return !this.forStaff && ((this.value.restricted && !this.forLater) || (this.value.scheduling_restricted && this.forLater));
  }

  get tooltipDescription(): string {
    if (this.passLimit && this.currentPage !== 'from') {
      return this.tooltipService.tooltipDescription(this.currentPage, this.passLimit, this.forStaff);
    }
  }

  get show_max_passes() {
    if (this.passLimit && this.passLimit.to_count && this.currentPage !== 'from') {
      return (!this.forStaff && this.currentSchool.show_active_passes_number);
    }
  }

  get showTooltip() {
    if (this.passLimit && this.passLimit.to_count && this.currentPage !== 'from') {
      return !this.forStaff &&
        this.currentSchool.show_active_passes_number ||
        (
          // TODO uncomment when branch SP-1050 is available
          // (this.currentPage === 'from' && this.passLimit.max_passes_from_active && this.passLimit.from_count === this.passLimit.max_passes_from) ||
          (this.currentPage === 'to' && this.passLimit.max_passes_to_active && this.passLimit.to_count === this.passLimit.max_passes_to)
        );
    }
  }

  get cursor() {
    return this.valid ? 'pointer' : 'not-allowed';
  }

  get gradient() {
    const gradient = (this.value as any).gradient;
    return 'radial-gradient(circle at 73% 71%, ' + gradient + ')';
  }

  get textColor() {
    if (this.valid) {
      if (this.hovered) {
        return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      }
    } else {
       return this.sanitizer.bypassSecurityTrustStyle('#CDCDCE');
    }
  }

  get roomColor() {
    if (this.valid) {
      if (this.hovered) {
        return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('#7F879D');
      }
    } else {
       return this.sanitizer.bypassSecurityTrustStyle('#CDCDCE');
    }
  }

  ngOnInit() {
    this.value.starred = this.starred;
  }

  changeColor(hovered, pressed?: boolean) {
    if (this.valid) {
      if (hovered) {
        if (pressed && !DeviceDetection.isAndroid()) {
          this.renderer.setStyle(this.cell.nativeElement, 'background-color', '#E2E7F4');
        } else {
          this.renderer.setStyle(this.cell.nativeElement, 'background-color', '#ECF1FF');
        }
      } else {
        this.renderer.setStyle(this.cell.nativeElement, 'background-color', '#FFFFFF');
      }
    } else {
      this.renderer.setStyle(this.cell.nativeElement, 'background-color', '#FFFFFF');
    }
  }

  tooltipDelay(hover, delayValue?) {
    if (hover) {
      of('').pipe(
        delay(delayValue),
      ).subscribe(res => {
        this.showTooltipWithDelay = true;
      });
    } else {
      this.showTooltipWithDelay = false;
    }
  }

  cellSelected() {
    if (this.valid) {
      this.onSelect.emit(this.value);
      if (this.allowOnStar) {
        this.star();
      }
    }
    this.onPress(false);
  }

  onPress(press) {
    if (this.allowOnStar) {
      let count = 100;
      if (press) {
        this.intervalId = setInterval(() => {
          if (count <= 1000) {
            count += 100;
          } else {
            this.screen.enabledLocationTableDnD.next(true);
            clearInterval(this.intervalId);
          }
        }, 100);
      } else {
        this.screen.enabledLocationTableDnD.next(false);
        clearInterval(this.intervalId);
      }
    }
  }

  star() {
      this.value.starred = !this.value.starred;
      if (!this.value.starred) {
        this.hovered = false;
        this.pressed = false;
        this.changeColor(false, false);
      }
      this.onStar.emit(this.value);
  }

}
