import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-integration-card',
  templateUrl: './integration-card.component.html',
  styleUrls: ['./integration-card.component.scss']
})
export class IntegrationCardComponent implements OnInit {

  @Input() icon: string;
  @Input() title: string;
  @Input() subtitle: string;
  @Input() learnMoreLink: string;
  @Input() status: 'disconnect' | 'approved' | 'done' = 'disconnect';

  @Output() setUp: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

}
