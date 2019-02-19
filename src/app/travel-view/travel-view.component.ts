import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';
import { MatDialog } from '@angular/material';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {BehaviorSubject} from 'rxjs';
import {filter} from 'rxjs/operators';

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
  isSeen$: BehaviorSubject<boolean>;
  type: string;
  locationChangeOpen: boolean = false;

  constructor(public dialog: MatDialog, private createFormService: CreateFormService) { }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
    (this.pass instanceof Invitation) ? 'invitation' :
      'request';
    this.isSeen$ = this.createFormService.isSeen$;
  }

  changeLocation(){
    if(!this.locationChangeOpen){
      console.log('Opening from location in travel view');
      const locationDialog = this.dialog.open(CreateHallpassFormsComponent, {
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

      locationDialog.beforeClose().subscribe(() => {
          this.locationChangeOpen = false;
      });

      locationDialog.afterClosed().pipe(filter(res => !!res)).subscribe(data => {
        console.log('Emiting with: ', data);
        this.locationSelected.emit((data.data && data.data['fromLocation']) ? data.data['fromLocation'] : this.pass['default_origin']);
      });
    }
  }

}
