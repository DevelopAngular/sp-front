import {Component, Input} from '@angular/core';
import {PassLimitInfo} from '../models/HallPassLimits';
import {NextStep} from '../animations';

@Component({
  selector: 'app-pass-limit-info',
  templateUrl: './pass-limit-info.component.html',
  styleUrls: ['./pass-limit-info.component.scss'],
  animations: [NextStep]
})
export class PassLimitInfoComponent {
  @Input() passLimitInfo: PassLimitInfo;
}
