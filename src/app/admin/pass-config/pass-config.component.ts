import {Component, ElementRef, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { HttpService } from '../../http-service';
import { Pinnable } from '../../models/Pinnable';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import {ConsentMenuComponent} from '../../consent-menu/consent-menu.component';
import {filter, map} from 'rxjs/operators';

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

  genOption(display, color, action) {
     return { display: display, color: color, action: action };
  }

  selectPinnable({data, event}) {
      this.selectedPinnables = data;
      const target = new ElementRef(event.currentTarget);
      const options = [];
      if (data.length > 0) {
          options.push(this.genOption('Bulk Edit Rooms', '#1F195E', 'edit_rooms'));
          options.push(this.genOption('New Folder With Selected Rooms', '#1F195E', 'new_folder_with_rooms'));
          options.push(this.genOption('Delete Rooms', 'red', 'delete_rooms'));
      } else {
          options.push(this.genOption('New Room', '#1F195E', 'new_room'));
          options.push(this.genOption('New Folder', '#1F195E', 'new_folder'));
      }
      const consetDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: { header: '', trigger: target, options: options }
      });

      consetDialog.afterClosed().pipe(filter(response => !!response))
          .subscribe(action => {
            this.buildData(action);
          });
  }

  buildData(action) {
      let data;
      let component = OverlayContainerComponent;
      switch (action) {
          case 'new_room': {
              data = { type: action };
              break;
          }
          case 'new_folder': {
              data = { type: action };
              break;
          }
          case 'edit_rooms': {
              data = { type: action, rooms: this.selectedPinnables };
              break;
          }
          case 'new_folder_with_rooms': {
              data = { type: action, rooms: this.selectedPinnables };
              break;
          }
          case 'delete_rooms': {
              return console.log('delete Method');
          }
      }
      return this.dialogContainer(data, component);
  }

  dialogContainer(data, component) {
      this.dialog.open(component, {
          panelClass: 'form-dialog-container',
          width: '65%',
          height: '700px',
          data: data
      });
  }

}
