import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import { MatDialog } from '@angular/material';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-pinnable-collection',
  templateUrl: './pinnable-collection.component.html',
  styleUrls: ['./pinnable-collection.component.scss']
})
export class PinnableCollectionComponent implements OnInit {

  @Input()
  pinnables: Pinnable[];

  @Output()
  roomEvent: EventEmitter<any> = new EventEmitter();

  selectedPinnables:Pinnable[] = [];
  buttonMenuOpen: boolean = false;

  get headerButtonText(){
    return (this.selectedPinnables.length > 0?'Bulk Edit Rooms':'New');
  }

  constructor(public dialog: MatDialog) { }

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

  buttonClicked(evnt: MouseEvent){
    if(!this.buttonMenuOpen){
      const target = new ElementRef(evnt.currentTarget);
      let options = [];

      if(this.selectedPinnables.length > 0){
        options.push(this.genOption('Bulk Edit Selection','#3D396B','edit'));
        options.push(this.genOption('New Folder with Selection','#3D396B','newFolderWithSelections'));
        options.push(this.genOption('Delete Selection','#E32C66','delete'));
      } else{
        options.push(this.genOption('New Room','#3D396B','newRoom'));
        options.push(this.genOption('New Folder','#3D396B','newFolder'));
      }

      const cancelDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'header': '', 'options': options, 'trigger': target}
      });

      cancelDialog.afterOpen().subscribe( () =>{
        this.buttonMenuOpen = true;
      });

      cancelDialog.afterClosed().pipe(filter(res => !!res)).subscribe(action =>{
        this.buttonMenuOpen = false;
        if(action){
          console.log('[Pinnable Collection, Dialog]:', action, ' --- ', this.selectedPinnables);
          this.roomEvent.emit({'action': action, 'selection': this.selectedPinnables});
        }
      });

    }
  }

  genOption(display, color, action) {
    return {display: display, color: color, action: action};
  }

}
