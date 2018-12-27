import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import { MatDialog } from '@angular/material';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import {forkJoin} from 'rxjs';
import {HttpService} from '../../http-service';
import {DragulaService} from 'ng2-dragula';

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
  @Output()
  orderChangedEvent: EventEmitter<number[]> = new EventEmitter<number[]>();

  selectedPinnables: Pinnable[] = [];
  buttonMenuOpen: boolean = false;
  bulkSelect: boolean  = false;

  pinnableIdArranged = [];

  get headerButtonText(){
    return (this.selectedPinnables.length < 1 || !this.bulkSelect?'New':'Bulk Edit Rooms');
  }

  get headerButtonIcon(){
    return (this.selectedPinnables.length < 1 || !this.bulkSelect?'./assets/Create (White).png':null);
  }

  constructor(
    public dialog: MatDialog,
    private http: HttpService,
    public dragulaService: DragulaService
  ) {
    // dragulaService.createGroup('pins', {
    //   removeOnSpill: true
    // });
  }

  ngOnInit() {
    setTimeout(() => {
      this.pinnableIdArranged = this.pinnables.map(pin => pin.id);
      console.log(this.pinnableIdArranged);

    }, 1000);
  }

  onPinablesOrderChanged(newOrder) {
    console.log(newOrder);
    this.orderChangedEvent.emit(newOrder);
  }

  clearSelected() {
    this.bulkSelect = false;
    this.selectedPinnables = [];
  }

  toggleBulk(){
    this.bulkSelect = !this.bulkSelect;
    this.selectedPinnables = [];
  }

  updatePinnables(pinnable: Pinnable) {
    if (!!this.selectedPinnables.find(pin => pin.id === pinnable.id)) {
     return this.selectedPinnables.splice(this.selectedPinnables.indexOf(pinnable), 1);
    } else {
      if (this.bulkSelect)
       return this.selectedPinnables.push(pinnable);
    }
      if (!this.header) {
        this.selectedPinnables.push(pinnable);
        this.roomEvent.emit(this.selectedPinnables);
      } else{
        this.roomEvent.emit({ action: 'room/folder_edit', selection: pinnable });
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
        if (action === 'delete') {
          const currentPinIds = this.selectedPinnables.map(pinnable => pinnable.id);
          this.pinnables = this.pinnables.filter(pinnable => pinnable.id !== currentPinIds.find(id => id === pinnable.id));
            const pinnableToDelete = this.selectedPinnables.map(pinnable => {
                return this.http.delete(`v1/pinnables/${pinnable.id}`);
            });
            return forkJoin(pinnableToDelete).subscribe(() => this.toggleBulk());
        } else {
            if (action) {
                console.log('[Pinnable Collection, Dialog]:', action, ' --- ', this.selectedPinnables);
                this.roomEvent.emit({'action': action, 'selection': this.selectedPinnables});
            }
        }
      });

    }
  }

  genOption(display, color, action) {
    return {display: display, color: color, action: action};
  }

}
