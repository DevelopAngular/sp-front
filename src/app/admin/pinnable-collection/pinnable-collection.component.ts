import {Component, OnInit, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import {MatDialog} from '@angular/material';
import {ConsentMenuComponent} from '../../consent-menu/consent-menu.component';

@Component({
  selector: 'app-pinnable-collection',
  templateUrl: './pinnable-collection.component.html',
  styleUrls: ['./pinnable-collection.component.scss']
})
export class PinnableCollectionComponent implements OnInit {

  @Input()
  pinnables: Pinnable[];

  @Output()
  selectedEvent: EventEmitter<any> = new EventEmitter();

  selectedPinnables: Pinnable[] = [];

  get headerButtonText() {
    return (this.selectedPinnables.length > 0 ? 'Bulk Edit Rooms' : 'New');
  }

  constructor() { }

  ngOnInit() {

  }

  updatePinnables(pinnable:Pinnable){
    if(this.selectedPinnables.includes(pinnable)){
      //console.log('[Pinnable Collection]: ', 'Pinnable In: ', this.selectedPinnables);
      this.selectedPinnables.splice(this.selectedPinnables.indexOf(pinnable), 1);
      //console.log('[Pinnable Collection]: ', 'Pinnable Removed: ', this.selectedPinnables)
    } else{
      //console.log('[Pinnable Collection]: ', 'Pinnable Not In: ', this.selectedPinnables);
      this.selectedPinnables.push(pinnable);
      //console.log('[Pinnable Collection]: ', 'Pinnable Added: ', this.selectedPinnables)
    }
  }

  submitSelection(event) {
      this.selectedEvent.emit({data: this.selectedPinnables, event: event});
  }

}
