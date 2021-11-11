import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-overview-container',
  templateUrl: './overview-container.component.html',
  styleUrls: ['./overview-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewContainerComponent implements OnInit {

  @Input() width: string = '100%';
  @Input() title: string;
  @Input() icon: string;

  constructor() { }

  ngOnInit(): void {
  }

}
