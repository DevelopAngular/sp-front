import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';
import { MatDialog } from '@angular/material';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import {DataService} from '../data-service';
import {LocationService} from '../hallpass-form/locations-group-container/location.service';

@Component({
  selector: 'app-travel-view',
  templateUrl: './travel-view.component.html',
  styleUrls: ['./travel-view.component.scss']
})

export class TravelViewComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;
  @Input() shrink: boolean = false;
  @Input() forStaff: boolean = false;
  
  @Output() locationSelected: EventEmitter<any> = new EventEmitter();
  isActivePass$ = this.dataService.isActivePass$.value;
  type: string;
  locationChangeOpen: boolean = false;

  constructor(public dialog: MatDialog, private dataService: DataService, private locService: LocationService) { }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
    (this.pass instanceof Invitation) ? 'invitation' :
      'request';
  }

  changeLocation(){
    if(!this.locationChangeOpen){
      console.log('Opening from location in travel view');
      this.locService.nextStep('from');
      const locationDialog = this.dialog.open(HallpassFormComponent, {
        // width: '750px',
        panelClass: 'form-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
              'forInput': false,
              'hasClose': true,
              'entryState': { step: 3, state: 1 },
              'originalToLocation': this.pass.destination,
              'colorProfile': this.pass.color_profile,
              'originalFromLocation': this.pass['default_origin']}
      });

      locationDialog.afterOpen().subscribe(() => {
        this.locationChangeOpen = true;
      });

      locationDialog.afterClosed().subscribe(data => {
        console.log('Emiting with: ', data);
        this.locationSelected.emit((data.data && data.data['fromLocation']) ? data.data['fromLocation'] : this.pass['default_origin']);
        this.locationChangeOpen = false;
      });
    }
  }

}
