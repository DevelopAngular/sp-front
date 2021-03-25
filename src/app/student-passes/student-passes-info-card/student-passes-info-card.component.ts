import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-student-passes-info-card',
  templateUrl: './student-passes-info-card.component.html',
  styleUrls: ['./student-passes-info-card.component.scss']
})
export class StudentPassesInfoCardComponent implements OnInit {

  @Input() number: string | number;
  @Input() title: string;
  @Input() loading: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
