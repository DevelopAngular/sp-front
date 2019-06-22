import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @Input() title: string;
  @Input() width: number = 315;
  @Input() plusIcon: boolean = true;
  @Input() infoData: any;

  @Output() select: EventEmitter<boolean> = new EventEmitter<boolean>();

  openInfo: boolean;

  mockInfo = [
      { info: 'Class of 2018 (43 accounts)' },
      { info: 'Class of 2019 (67 accounts)' }
  ];

  constructor() { }

  ngOnInit() {
  }

  selected() {
    this.openInfo = !this.openInfo;
    this.select.emit(this.openInfo);
  }

}