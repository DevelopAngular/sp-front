import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-bulk-edit-rooms',
  templateUrl: './bulk-edit-rooms.component.html',
  styleUrls: ['./bulk-edit-rooms.component.scss']
})
export class BulkEditRoomsComponent implements OnInit {

  @Input() form: FormGroup;

  constructor() { }

  ngOnInit() {
  }

}
