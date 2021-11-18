import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ExclusionGroup} from '../../../../models/ExclusionGroup';

@Component({
  selector: 'app-encounter-group',
  templateUrl: './encounter-group.component.html',
  styleUrls: ['./encounter-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EncounterGroupComponent implements OnInit {

  @Input() group: ExclusionGroup;

  @Output() clickEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

}
