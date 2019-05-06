import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import { MatDialog } from '@angular/material';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { HallPassesService } from '../../services/hall-passes.service';
import {DarkThemeSwitch} from '../../dark-theme-switch';

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

  @Input() resetBulkSelect$: BehaviorSubject<boolean>;

  @Input() width: string = '560px';

  @Input() isEmptyState: boolean = false;

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
    return (this.selectedPinnables.length < 1 || !this.bulkSelect?'./assets/Plus (White).svg':null);
  }

  constructor(
    public dialog: MatDialog,
    private hallPassService: HallPassesService,
    public darkTheme: DarkThemeSwitch

  ) {
    // dragulaService.createGroup('pins', {
    //   removeOnSpill: true
    // });
  }

  ngOnInit() {
    if (!this.pinnables) {
      this.pinnables = [];
    }

      setTimeout(() => {
      this.pinnableIdArranged = this.pinnables.map(pin => pin.id);
      // console.log(this.pinnableIdArranged);
        if (!this.pinnableIdArranged.length) {
          this.isEmptyState = true;
        }

    }, 1000);
    if (this.resetBulkSelect$) {
        this.resetBulkSelect$.subscribe((val: boolean) => {
            if (val) {
                this.bulkSelect = false;
            }
        });
    }
  }

  onPinablesOrderChanged(newOrder) {
    // console.log(newOrder);
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

  isSelected(pinnable: Pinnable): boolean {
    return this.selectedPinnables.findIndex((P: Pinnable) => P.id === pinnable.id) !== -1;
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
        options.push(this.genOption('Bulk Edit Selection', this.darkTheme.getColor(), 'edit'));
        options.push(this.genOption('New Folder with Selection', this.darkTheme.getColor(), 'newFolder'));
        // options.push(this.genOption('Delete Selection','#E32C66','delete'));
      } else{
        options.push(this.genOption('New Room', this.darkTheme.getColor(), 'newRoom'));
        options.push(this.genOption('New Folder', this.darkTheme.getColor(), 'newFolder'));
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
                return this.hallPassService.deletePinnable(pinnable.id);
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
