import {Component, EventEmitter, OnInit, Output} from '@angular/core';

declare const window;

@Component({
  selector: 'app-gg4l-set-up',
  templateUrl: './gg4l-set-up.component.html',
  styleUrls: ['./gg4l-set-up.component.scss']
})
export class Gg4lSetUpComponent implements OnInit {

  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  close() {
    this.back.emit();
  }

  openLink(link) {
    window.open(link, '_blank');
  }

}
