import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-class-link',
  templateUrl: './class-link.component.html',
  styleUrls: ['./class-link.component.scss']
})
export class ClassLinkComponent implements OnInit {

  @Output() backEmit: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
   
  }

  back() {
    this.backEmit.emit();
  }
}
