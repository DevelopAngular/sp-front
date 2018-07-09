import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HallPass, Invitation, Request } from '../NewModels';
import { MatDialog } from '@angular/material';
import { InfoEditorComponent } from '../info-editor/info-editor.component';

@Component({
  selector: 'app-travel-view',
  templateUrl: './travel-view.component.html',
  styleUrls: ['./travel-view.component.scss']
})

export class TravelViewComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;
  @Input() shrink: boolean = false;
  
  @Output() locationSelected: EventEmitter<any> = new EventEmitter();

  type: string;
  locationChangeOpen: boolean = false;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
    (this.pass instanceof Invitation) ? 'invitation' :
      'request';
  }

  changeLocation(){
    if(!this.locationChangeOpen){
      const locationDialog = this.dialog.open(InfoEditorComponent, {
        panelClass: 'location-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'type': 'location'}
      });
  
      locationDialog.afterOpen().subscribe(() =>{
        this.locationChangeOpen = true;
      });
  
      locationDialog.afterClosed().subscribe(data =>{
        console.log('Emiting with: ', data);
        this.locationSelected.emit(data?data:this.pass['default_origin']);
        this.locationChangeOpen = false;
      });
    }
  }

}
