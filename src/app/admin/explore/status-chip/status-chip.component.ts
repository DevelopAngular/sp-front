import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Status} from '../../../models/Report';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss']
})
export class StatusChipComponent implements OnInit {

  @Input() status: Status;

  @Output() statusClick: EventEmitter<Status> = new EventEmitter<Status>();

  // text representing status
  label: string;
  // class associated with status
  classname: string;

  constructor() { }

  ngOnInit(): void {
    this.label = this.status;
    this.classname = this.status;
  }

  ngAfterViewInit() {
  }

  blink() {
    this.statusClick.emit(this.status);
  }

}
