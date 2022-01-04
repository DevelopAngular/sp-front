import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-nux-encounter-prevention',
  templateUrl: './nux-encounter-prevention.component.html',
  styleUrls: ['./nux-encounter-prevention.component.scss']
})
export class NuxEncounterPreventionComponent implements OnInit {

  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

}
