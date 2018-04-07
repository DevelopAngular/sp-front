import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pass-info',
  templateUrl: './pass-info.component.html',
  styleUrls: ['./pass-info.component.css']
})
export class PassInfoComponent implements OnInit {

  @Input()
  pass;

  constructor() { }

  ngOnInit() {
  }

}
