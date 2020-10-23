import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-link-card',
  templateUrl: './link-card.component.html',
  styleUrls: ['./link-card.component.scss']
})
export class LinkCardComponent implements OnInit {

  @Input() title: string;
  @Input() subtitle: string;
  @Input() buttonText: string;
  @Input() buttonColor: string;
  @Input() leftIcon: string;
  @Input() rightIcon: string;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

}
