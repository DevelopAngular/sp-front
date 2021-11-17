import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../models/User';

@Component({
  selector: 'app-encounter-prevention-tooltip',
  templateUrl: './encounter-prevention-tooltip.component.html',
  styleUrls: ['./encounter-prevention-tooltip.component.scss']
})
export class EncounterPreventionTooltipComponent implements OnInit {

  @Input() profile: User;

  students: User[];

  constructor() { }

  ngOnInit(): void {
    this.students = [this.profile, this.profile, this.profile]
  }

}
