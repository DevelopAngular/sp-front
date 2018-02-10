import { Component, OnInit, Input } from '@angular/core';
import { HallPass } from '../pass-list/pass-list.component';

@Component({
  selector: 'app-hall-pass',
  templateUrl: './hall-pass.component.html',
  styleUrls: ['./hall-pass.component.css']
})
export class HallPassComponent implements OnInit {
  @Input()
  hallPass: HallPass;
  
  constructor() { }

  ngOnInit() {
  }

}
