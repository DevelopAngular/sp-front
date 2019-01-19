import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Pinnable} from '../../../models/Pinnable';
import {LocationService} from '../location.service';

@Component({
  selector: 'app-restricted-target',
  templateUrl: './restricted-target.component.html',
  styleUrls: ['./restricted-target.component.scss']
})
export class RestrictedTargetComponent implements OnInit {

  @Input() pinnable: Pinnable;

  @Input() date;

  @Input() toLocation;

  @Input() fromLocation;

  @Output() requestTarget: EventEmitter<any> = new EventEmitter<any>();

  constructor(private locService: LocationService) { }

  get headerGradient() {
    const colors = this.pinnable.gradient_color;
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
  }

  back() {
    this.locService.changeLocation$.next('category');
  }

  updateTarget(target) {
    this.requestTarget.emit(target);
  }

}
