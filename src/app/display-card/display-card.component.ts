import { Component, OnInit, Input } from '@angular/core';
import { NavbarDataService } from '../main/navbar-data.service';

@Component({
  selector: 'app-display-card',
  templateUrl: './display-card.component.html',
  styleUrls: ['./display-card.component.scss']
})
export class DisplayCardComponent implements OnInit {

  @Input() hasDivider: boolean = true;
  @Input() inbox: boolean = false;
  @Input() title: string;
  @Input() icon: string;
  @Input() fontSize: string;

  constructor(private navbarData: NavbarDataService) { }

  get notificationBadge$() {
    return this.navbarData.notificationBadge$;
  }

  ngOnInit() {
  }

}
