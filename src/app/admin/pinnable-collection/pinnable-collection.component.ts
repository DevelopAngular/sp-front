import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import { MatDialog } from '@angular/material';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';

@Component({
  selector: 'app-pinnable-collection',
  templateUrl: './pinnable-collection.component.html',
  styleUrls: ['./pinnable-collection.component.scss']
})
export class PinnableCollectionComponent implements OnInit {

  @Input()
  pinnables: Pinnable[];

  @Input()
  header: boolean = true;

  @Output()
  roomEvent: EventEmitter<any> = new EventEmitter();

  selectedPinnables:Pinnable[] = [];
  buttonMenuOpen: boolean = false;
  bulkSelect: boolean  = false;

  get headerButtonText(){
    return (this.selectedPinnables.length < 1 || !this.bulkSelect?'New':'Bulk Edit Rooms');
  }

  get headerButtonIcon(){
    return (this.selectedPinnables.length < 1 || !this.bulkSelect?'./assets/Create (White).png':null);
  }

  constructor(public dialog: MatDialog) { }

  ngOnInit() {

  }

  toggleBulk(){
    this.bulkSelect = !this.bulkSelect;
    this.selectedPinnables = [];
  }

  updatePinnables(pinnable:Pinnable){
    if(this.selectedPinnables.includes(pinnable)){
      this.selectedPinnables.splice(this.selectedPinnables.indexOf(pinnable), 1);
    } else{
      if(this.bulkSelect)
        this.selectedPinnables.push(pinnable);
    }
    if (!this.header) {
      if(this.bulkSelect){
        this.roomEvent.emit(this.selectedPinnables);
      } else{
        this.roomEvent.emit(pinnable);
      }
    }
  }

  buttonClicked(evnt: MouseEvent){
    if(!this.buttonMenuOpen){
      const target = new ElementRef(evnt.currentTarget);
      let options = [];

      if(this.selectedPinnables.length > 0 && this.bulkSelect){
        options.push(this.genOption('Bulk Edit Selection','#3D396B','edit'));
        options.push(this.genOption('New Folder with Selection','#3D396B','newFolder'));
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

      cancelDialog.afterClosed().subscribe(action =>{
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
