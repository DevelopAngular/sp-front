import { Component, OnInit, Input } from '@angular/core';
import { Invitation, HallPass, Request } from '../NewModels';

@Component({
  selector: 'app-pass-collection',
  templateUrl: './pass-collection.component.html',
  styleUrls: ['./pass-collection.component.scss']
})
export class PassCollectionComponent implements OnInit {

  @Input() passes: HallPass[] | Invitation[] | Request[];

  @Input() displayState: string = "list";

  @Input() title: string;

  @Input() icon: string;

  @Input() columns: number = 3;

  constructor() { }

  ngOnInit() {
  }

}
