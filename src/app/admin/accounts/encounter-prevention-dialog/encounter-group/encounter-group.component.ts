import {Component, Input, OnInit} from '@angular/core';
import {EncountersState} from '../encounter-prevention-dialog.component';

@Component({
  selector: 'app-encounter-group',
  templateUrl: './encounter-group.component.html',
  styleUrls: ['./encounter-group.component.scss']
})
export class EncounterGroupComponent implements OnInit {

  @Input() state: EncountersState;

  constructor() { }

  ngOnInit(): void {
  }

}
