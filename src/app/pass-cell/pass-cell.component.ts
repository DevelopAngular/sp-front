import { Component, Input, OnInit } from '@angular/core';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';
import { getInnerPassContent, getInnerPassName, isBadgeVisible } from '../pass-tile/pass-display-util';

@Component({
  selector: 'app-pass-cell',
  templateUrl: './pass-cell.component.html',
  styleUrls: ['./pass-cell.component.scss']
})
export class PassCellComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;
  @Input() fromPast = false;
  @Input() forFuture = false;
  @Input() isActive = false;
  @Input() forStaff = false;

  constructor() {
  }

  ngOnInit() {

  }

  get cellName() {
    return getInnerPassName(this.pass);
  }

  get cellContent() {
    return getInnerPassContent(this.pass);
  }

  get isBadgeVisible() {
    return isBadgeVisible(this.pass);
  }

}
