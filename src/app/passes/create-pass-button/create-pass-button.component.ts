import {Component, EventEmitter, Input, AfterViewInit, OnChanges, SimpleChanges, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {bumpIn} from '../../animations';
import {PassLimitInfo} from '../../models/HallPassLimits';
import {UserService} from '../../services/user.service';
import {ConnectedPosition} from '@angular/cdk/overlay';

@Component({
  selector: 'app-create-pass-button',
  templateUrl: './create-pass-button.component.html',
  styleUrls: ['./create-pass-button.component.scss'],
  animations: [bumpIn]
})
export class CreatePassButtonComponent implements OnChanges, AfterViewInit {
  @Input() title: string;
  @Input() gradient: string;
  @Input() disabled: boolean;
  @Input() passLimitInfo: PassLimitInfo;
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  buttonDown: boolean;
  hovered: boolean;
  nuxWrapperPosition: ConnectedPosition = {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 15
  };
  showPassLimitNux = new Subject<boolean>();
  solid_color = '#00B476';
  introsData: any;

  constructor(private sanitizer: DomSanitizer, private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.title !== 'Now') {
      return;
    }

    if (!this.passLimitInfo) {
      this.passLimitInfo = {showPasses: false};
    }

    this.userService.introsData$.subscribe({
      next: intros => {
        this.introsData = intros;
        this.showPassLimitNux.next(!!this.passLimitInfo?.showPasses && !intros?.pass_limits_reminder?.universal?.seen_version);
      }
    });
  }

  ngAfterViewInit() {
    if (this.title === 'Now') {
      this.nuxWrapperPosition = {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 40,
        offsetX: -10
      };
    }
  }

  get buttonState() {
    return this.buttonDown && !this.disabled ? 'down' : 'up';
  }

  get boxShadow() {
    let i = 0;
    const hexColors = [];
    const rawHex = this.solid_color.slice(1);
    do {
      hexColors.push(rawHex.slice(i, i + 2));
      i += 2;
    } while (i < rawHex.length);
    const rgbString = hexColors.map(color => parseInt(color, 16)).join(', ');
    return this.sanitizer.bypassSecurityTrustStyle(this.hovered ?
      `0px 3px 10px rgba(${rgbString}, 0.3)` :
      this.buttonDown ? `0px 3px 5px rgba(${rgbString}, 0.15)` : '0px 3px 5px rgba(0, 0, 0, 0.1)');
  }

  backgroundGradient() {
    if (this.buttonDown && !this.disabled) {
      return this.solid_color;
    } else {
      return 'radial-gradient(circle at 73% 71%, #00B467, #15D593)';
    }
  }

  buttonClick() {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }

  dismissNux() {
    this.showPassLimitNux.next(false);
    this.userService.updateIntrosStudentPassLimitRequest(this.introsData, 'universal',  '1')
  }

}
