import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-toggle-options',
  templateUrl: './toggle-options.component.html',
  styleUrls: ['./toggle-options.component.scss']
})
export class ToggleOptionsComponent implements OnInit {

  @Input() options;
  @Input() selectedId;

  @Output() result = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    if (this.selectedId) {
        this.result.emit(this.selectedId);
    }
  }

  selectedOptions(id) {
    this.selectedId = id;
    this.result.emit(this.selectedId);
  }

}
