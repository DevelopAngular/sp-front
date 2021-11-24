import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-octagon',
  templateUrl: './octagon.component.html',
  styleUrls: ['./octagon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OctagonComponent implements OnInit {

  @Input() size: number = 70;
  @Input() backgroundColor: string = '#E32C66';
  @Input() borderColor: string = '#EF8BAB';
  @Input() borderWidth: number = 2.5;
  @Input() hasTooltip: boolean;
  @Input() tooltipText: string;

  constructor() { }

  ngOnInit(): void {
  }

}
