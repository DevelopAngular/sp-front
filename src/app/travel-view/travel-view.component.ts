import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';
import { MatDialog } from '@angular/material';
import { InfoEditorComponent } from '../info-editor/info-editor.component';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';

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
      const locationDialog = this.dialog.open(HallpassFormComponent, {
        width: '750px',
        panelClass: 'form-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'entryState': 'from',
              'originalToLocation': this.pass.destination,
              'colorProfile': this.pass.color_profile,
              'originalFromLocation': this.pass['default_origin']}
      });
  
      locationDialog.afterOpen().subscribe(() =>{
        this.locationChangeOpen = true;
      });
  
      locationDialog.afterClosed().subscribe(data =>{
        console.log('Emiting with: ', data);
        this.locationSelected.emit(data['fromLocation']?data['fromLocation']:this.pass['default_origin']);
        this.locationChangeOpen = false;
      });
    }
  }

}
