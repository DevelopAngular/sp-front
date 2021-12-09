import {Component, Input, OnInit} from '@angular/core';
import {ExclusionGroup} from '../../models/ExclusionGroup';

@Component({
  selector: 'app-encounter-prevention-tooltip',
  templateUrl: './encounter-prevention-tooltip.component.html',
  styleUrls: ['./encounter-prevention-tooltip.component.scss']
})
export class EncounterPreventionTooltipComponent implements OnInit {

  @Input() groups: ExclusionGroup[];

  constructor() { }

  ngOnInit(): void {
  }

}
