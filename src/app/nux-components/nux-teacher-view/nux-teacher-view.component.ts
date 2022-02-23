import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-nux-teacher-view',
  templateUrl: './nux-teacher-view.component.html',
  styleUrls: ['./nux-teacher-view.component.scss']
})
export class NuxTeacherViewComponent implements OnInit {

  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  @Output() tryButton: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

}
