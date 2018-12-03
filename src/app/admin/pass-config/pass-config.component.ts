import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { HttpService } from '../../http-service';
import { Pinnable } from '../../models/Pinnable';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import * as _ from 'lodash';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-pass-congif',
  templateUrl: './pass-config.component.html',
  styleUrls: ['./pass-config.component.scss']
})
export class PassConfigComponent implements OnInit {

    settingsForm: FormGroup;
    schoolName = 'Springfield High School';
    selectedPinnables: Pinnable[];
    pinnable: Pinnable;
    pinnables$: Observable<Pinnable[]>;
    icons$;
    colors$;

    dataChanges: any[] = [];

  constructor(
      private dialog: MatDialog,
      private httpService: HttpService
  ) { }

  ngOnInit() {
      this.buildForm();
      this.pinnables$ = this.httpService.get('v1/pinnables');
      this.icons$ = this.httpService.get('v1/room_icons');
      this.colors$ = this.httpService.get('v1/color_profiles');

  }

  buildForm() {
      this.settingsForm = new FormGroup({
          isFuture: new FormControl(true),
          defaultTime: new FormControl('5 min'),
      });
  }

  selectPinnable({action, selection}) {
      if (action === 'room/folder_edit' && !_.isArray(selection)) {
          this.pinnable = selection;
        return this.buildData(this.pinnable.type === 'location' ? 'editRoom' : 'editFolder');
      }
      this.selectedPinnables = selection;
      this.buildData(action);
  }

  buildData(action) {
      let data;
      let component = OverlayContainerComponent;
      switch (action) {
          case 'newRoom': {
              data = {
                  type: action,
                  icons$: this.icons$,
                  colors$: this.colors$
              };
              break;
          }
          case 'newFolder': {
              data = {
                  type: action,
                  pinnables$: this.pinnables$,
                  rooms: this.selectedPinnables,
                  icons$: this.icons$,
                  colors$: this.colors$
              };
              break;
          }
          case 'editRoom': {
              data = {
                  type: action,
                  pinnable: this.pinnable,
                  icons$: this.icons$,
                  colors$: this.colors$
              };
              break;
          }
          case 'editFolder': {
              data = {
                  type: 'newFolder',
                  pinnable: this.pinnable,
                  pinnables$: this.pinnables$,
                  icons$: this.icons$,
                  colors$: this.colors$
              };
              break;
          }
          case 'edit': {
              data = {
                  type: action,
                  rooms: this.selectedPinnables,
                  icons$: this.icons$,
                  colors$: this.colors$
              };
              break;
          }
          case 'newFolderWithSelections': {
              data = {
                  type: 'newFolder',
                  rooms: this.selectedPinnables,
                  icons$: this.icons$,
                  colors$: this.colors$
              };
              break;
          }
          case 'delete': {
              return console.log('delete Method');
          }
      }
      return this.dialogContainer(data, component);
  }

  dialogContainer(data, component) {
     const overlayDialog =  this.dialog.open(component, {
          panelClass: 'overlay-dialog',
          backdropClass: 'custom-bd',
          width: '1018px',
          height: '600px',
          data: data
      });

     overlayDialog.afterClosed().pipe(filter(res => !!res)).subscribe(response => {
         this.dataChanges.push(response);
     });
  }

  saveChanges() {
    console.log('request', this.dataChanges);
  }

  discard() {
    this.dataChanges = [];
  }

}
