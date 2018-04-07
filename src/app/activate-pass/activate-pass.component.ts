import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-activate-pass',
  templateUrl: './activate-pass.component.html',
  styleUrls: ['./activate-pass.component.css']
})
export class ActivatePassComponent implements OnInit {
  @Input()
  pass;

  constructor() { }

  ngOnInit() {
  }

}
