import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-nux-universal',
  templateUrl: './nux-universal.component.html',
  styleUrls: ['./nux-universal.component.scss']
})
export class NuxUniversalComponent implements OnInit {

  @Input() description: string;
  @Input() link: string;

  @Output() gotItEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

}
