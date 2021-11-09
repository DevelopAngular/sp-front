import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-round-button',
  templateUrl: './round-button.component.html',
  styleUrls: ['./round-button.component.scss']
})
export class RoundButtonComponent implements OnInit {

  @Input() icon: string;
  @Input() size: number = 44;
  @Input() backgroundColor: string = '#FFFFFF';
  @Input() iconWidth: number = 20;

  constructor() { }

  ngOnInit(): void {
  }

}
