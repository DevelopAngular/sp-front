import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-start-card',
  templateUrl: './start-card.component.html',
  styleUrls: ['./start-card.component.scss']
})
export class StartCardComponent implements OnInit {

  @Input() title: string;
  @Input() subtitle: string;
  @Input() buttonText: string;
  @Input() buttonIcon: string;

  @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

}
