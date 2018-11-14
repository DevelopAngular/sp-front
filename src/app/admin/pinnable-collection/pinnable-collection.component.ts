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
  selectedEvent: EventEmitter<Pinnable[]> = new EventEmitter();

  selectedPinnables:Pinnable[] = [];

  get headerButtonText(){
    return (this.selectedPinnables.length > 0?'Bulk Edit Rooms':'New');
  }

  constructor(private dialog: MatDialog) { }

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
    this.selectedEvent.emit(this.selectedPinnables);
  }

  submitSelection(event) {
    const target = new ElementRef(event.currentTarget);
    const options = [];
    if (this.selectedPinnables.length > 0) {
        options.push(this.genOption('Bulk Edit Rooms', '#1F195E', 'edit_rooms'));
        options.push(this.genOption('New Folder With Selected Rooms', '#1F195E', 'new_folder_with_rooms'));
        options.push(this.genOption('Delete Rooms', 'red', 'delete_rooms'));
    } else {
        options.push(this.genOption('New Room', '#1F195E', 'create_room'));
        options.push(this.genOption('New Folder', '#1F195E', 'create_folder'));
    }
      const consetDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: { header: '', trigger: target, options: options }
      });
  }

    genOption(display, color, action) {
        return { display: display, color: color, action: action };
    }

}
