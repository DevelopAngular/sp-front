import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {EncountersState} from '../encounter-prevention-dialog.component';
import {ExclusionGroup, PreventEncounters} from '../../../../models/ExclusionGroup';
import * as moment from 'moment';

@Component({
  selector: 'app-encounter-group-description',
  templateUrl: './encounter-group-description.component.html',
  styleUrls: ['./encounter-group-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EncounterGroupDescriptionComponent implements OnInit {

  @Input() state: EncountersState;
  @Input() group: ExclusionGroup;

  constructor() { }

  ngOnInit(): void {
  }

  getDate(date) {
    return moment(date).format('MMM. DD, YYYY');
  }

  getTime(date) {
    return moment(date).format('hh:mm A');
  }

  description(encounter: PreventEncounters): string {
    return `${encounter.first_name + encounter.last_name} was going from ${encounter.origin}
    to ${encounter.destination} on ${this.getDate(encounter.created)}
    from ${this.getTime(encounter.pass_time)} to ${this.getTime(encounter.pass_end)}.`;
  }

}
