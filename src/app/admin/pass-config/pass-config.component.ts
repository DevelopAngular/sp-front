import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { HttpService } from '../../http-service';
import { Pinnable } from '../../models/Pinnable';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import {map, shareReplay} from 'rxjs/operators';

@Component({
  selector: 'app-pass-congif',
  templateUrl: './pass-config.component.html',
  styleUrls: ['./pass-config.component.scss']
})
export class PassConfigComponent implements OnInit {

    settingsForm: FormGroup;
    schoolName = 'Springfield High School';
    selectedPinnables: Pinnable[];
    pinnables$: Observable<Pinnable[]>;

    data = [
        {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', surname: 'Petrov'},
        {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', surname: 'Petrov'},
        {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', surname: 'Petrov'},
        {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be', surname: 'Petrov'},
        {position: 5, name: 'Boron', weight: 10.811, symbol: 'B', surname: 'Petrov'},
        {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', surname: 'Petrov'},
        {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', surname: 'Petrov'},
        {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', surname: 'Petrov'},
        {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F', surname: 'Petrov'},
        {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', surname: 'Petrov'},
    ];

  constructor(
      private dialog: MatDialog,
      private httpService: HttpService
  ) { }

  ngOnInit() {
      this.buildForm();
      this.pinnables$ = this.httpService.get('v1/pinnables');
  }

  buildForm() {
      this.settingsForm = new FormGroup({
          isFuture: new FormControl(true),
          defaultTime: new FormControl('5 min'),
      });
  }

  selectPinnable({action, selection}) {
      this.selectedPinnables = selection;
      this.buildData(action);
  }

  buildData(action) {
      let data;
      let component = OverlayContainerComponent;
      switch (action) {
          case 'newRoom': {
              data = { type: action };
              break;
          }
          case 'newFolder': {
              const pinnables$ = this.pinnables$.pipe(map(pinnables => {
                  return pinnables.filter(pinnable => pinnable.type !== 'category');
              }), shareReplay(1));
              data = { type: action, pinnables$: pinnables$ };
              break;
          }
          case 'edit': {
              data = { type: action, rooms: this.selectedPinnables };
              break;
          }
          case 'newFolderWithSelections': {
              data = { type: action, rooms: this.selectedPinnables };
              break;
          }
          case 'delete': {
              return console.log('delete Method');
          }
      }
      return this.dialogContainer(data, component);
  }

  dialogContainer(data, component) {
      this.dialog.open(component, {
          panelClass: 'form-dialog-container',
          width: '1018px',
          height: '600px',
          data: data
      });
  }

}
