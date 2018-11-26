import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { HttpService } from '../../http-service';
import { Pinnable } from '../../models/Pinnable';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';

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
              data = { type: action, pinnables$: this.pinnables$, rooms: this.selectedPinnables };
              break;
          }
          case 'edit': {
              data = { type: action, rooms: this.selectedPinnables };
              break;
          }
          case 'newFolderWithSelections': {
              data = { type: 'newFolder', rooms: this.selectedPinnables };
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
          panelClass: 'overlay-dialog',
          backdropClass: 'custom-bd',
          width: '1018px',
          height: '600px',
          data: data
      });
  }

}
