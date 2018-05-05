import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pinnable',
  templateUrl: './pinnable.component.html',
  styleUrls: ['./pinnable.component.css']
})
export class PinnableComponent implements OnInit {

  @Input()
  iconURL: string = "";

  @Input()
  gradient: string = "";

  @Input()
  title: string = "";

  @Input()
  type: string = "";

  @Input()
  restricted: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
