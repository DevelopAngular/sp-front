import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-menu-choose',
  templateUrl: './menu-choose.component.html',
  styleUrls: ['./menu-choose.component.css']
})
export class MenuChooseComponent implements OnInit {

  public router: Router;

  constructor(private _router: Router) {
    this.router = _router;
  }

  ngOnInit() {

  }

  goToList(){
    this.router.navigate(['../list']);
  }

  goToForm(){
    this.router.navigate(['../form']);
  }

}
