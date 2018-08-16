import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-smartpass-logo',
  templateUrl: './smartpass-logo.component.html',
  styleUrls: ['./smartpass-logo.component.scss']
})
export class SmartpassLogoComponent {

  @Input() scale = 1;

  constructor() { }

  get transformRules() {
    return `scale(${this.scale})`;
  }

}
