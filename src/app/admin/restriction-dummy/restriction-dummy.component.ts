import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-restriction-dummy',
  templateUrl: './restriction-dummy.component.html',
  styleUrls: ['./restriction-dummy.component.scss']
})
export class RestrictionDummyComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }
  goHome() {
    this.router.navigate(['/main']);
  }
}
