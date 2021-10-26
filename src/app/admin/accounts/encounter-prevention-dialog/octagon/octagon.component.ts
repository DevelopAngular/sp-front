import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-octagon',
  templateUrl: './octagon.component.html',
  styleUrls: ['./octagon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OctagonComponent implements OnInit {

  @Input() size: number = 70;

  constructor() { }

  ngOnInit(): void {
  }

}
