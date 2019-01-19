import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-restricted-target',
  templateUrl: './restricted-target.component.html',
  styleUrls: ['./restricted-target.component.scss']
})
export class RestrictedTargetComponent implements OnInit {

  constructor() { }

  get headerGradient() {
    const colors = '#03CF31,#00B476';
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
  }

  updateTarget(event) {

  }

}
