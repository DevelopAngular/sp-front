import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {resizeReportDescription} from '../../../../animations';

@Component({
  selector: 'app-report-description',
  templateUrl: './report-description.component.html',
  styleUrls: ['./report-description.component.scss'],
  animations: [resizeReportDescription]
})
export class ReportDescriptionComponent implements OnInit {

  @ViewChild('wrapper') wrapper: ElementRef;

  animationTrigger: any;
  isOpen: boolean;

  constructor() {}

  ngOnInit() {
  }

  setStartHeight() {
    this.isOpen = !this.isOpen;
    this.animationTrigger = {value: this.isOpen ? 'open' : 'close', params: {startHeight: this.wrapper.nativeElement.clientHeight}};
  }
}
