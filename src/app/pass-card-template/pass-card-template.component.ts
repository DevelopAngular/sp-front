import { Component, OnInit, Input } from '@angular/core';
import { HallPass, Invitation, Request} from '../NewModels';
@Component({
  selector: 'app-pass-card-template',
  templateUrl: './pass-card-template.component.html',
  styleUrls: ['./pass-card-template.component.scss']
})
export class PassCardTemplateComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;
  @Input() hasDivider: boolean = false;

  constructor() {}

  ngOnInit() {
  }

  getGradient() {
    let gradient: string[] = this.pass.gradient_color.split(',');

    return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
  }

}
