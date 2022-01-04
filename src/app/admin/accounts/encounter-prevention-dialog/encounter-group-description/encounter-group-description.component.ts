import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {EncountersState} from '../encounter-prevention-dialog.component';
import {ExclusionGroup, PreventEncounters} from '../../../../models/ExclusionGroup';
import * as moment from 'moment';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-encounter-group-description',
  templateUrl: './encounter-group-description.component.html',
  styleUrls: ['./encounter-group-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EncounterGroupDescriptionComponent implements OnInit {

  @Input() state: EncountersState;
  @Input() group: ExclusionGroup;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.group.prevented_encounters = this.group.prevented_encounters.reverse();
  }

  getDate(date) {
    return moment(date).format('MMM. DD, YYYY');
  }

  getTime(date) {
    return moment(date).format('hh:mm A');
  }

  description(encounter: PreventEncounters): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(`<span style="word-break: break-word; user-select: text">${encounter.conflict_pass_student_name} was going from <span style="text-decoration: underline">${encounter.conflict_pass_origin}</span>
    to <span style="text-decoration: underline">${encounter.conflict_pass_destination}</span> on ${this.getDate(encounter.conflict_pass_start_time)}
    from ${this.getTime(encounter.conflict_pass_start_time)} to ${this.getTime(encounter.conflict_pass_end)}. At ${this.getTime(encounter.pass_time)}, ${encounter.conflict_pass_staff_name || (encounter.first_name + encounter.last_name)} attempted to create a pass from
    <span style="text-decoration: underline">${encounter.origin}</span> to <span style="text-decoration: underline">${encounter.destination}</span>, but it was prevented. </span>`);
  }

}
