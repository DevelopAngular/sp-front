import {Component, Input, OnInit} from '@angular/core';
import {ExclusionGroup} from '../../models/ExclusionGroup';

@Component({
  selector: 'app-encounter-prevention-tooltip',
  templateUrl: './encounter-prevention-tooltip.component.html',
  styleUrls: ['./encounter-prevention-tooltip.component.scss']
})
export class EncounterPreventionTooltipComponent implements OnInit {

  @Input() groups: ExclusionGroup[];

  page: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  nextPage() {
    this.page += 1;
    console.log(this.page, this.groups.length);
  }

  prevPage() {
    this.page -= 1;
  }

}
