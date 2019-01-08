import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { HttpService } from '../../http-service';
import { Pinnable } from '../../models/Pinnable';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import {PinnableCollectionComponent} from '../pinnable-collection/pinnable-collection.component';
import * as _ from 'lodash';
import { disableBodyScroll } from 'body-scroll-lock';

@Component({
  selector: 'app-pass-congif',
  templateUrl: './pass-config.component.html',
  styleUrls: ['./pass-config.component.scss']
})
export class PassConfigComponent implements OnInit, OnDestroy {

    @ViewChild(PinnableCollectionComponent) pinColComponent;

    settingsForm: FormGroup;
    schoolName;
    selectedPinnables: Pinnable[];
    pinnable: Pinnable;
    pinnables$: Observable<Pinnable[]>;
    pinnables;
    schools$;

    dataChanges: any[] = [];

  constructor(
      private dialog: MatDialog,
      private httpService: HttpService,
      private elRef: ElementRef
  ) { }

  ngOnInit() {
      disableBodyScroll(this.elRef.nativeElement);
      this.buildForm();
      this.pinnables$ = this.httpService.get('v1/pinnables/arranged');
      this.schools$ = this.httpService.get('v1/schools');
      this.schools$.subscribe(res => this.schoolName =  res[0].name);
      this.pinnables$.subscribe(res => this.pinnables = res);

  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }


  updatePinnablesOrder(newOrder) {

    const pinnableIdArranged = newOrder.map(pin => pin.id);


    this.httpService
      .post('v1/pinnables/arranged', {
        order: pinnableIdArranged.join(',')
      })
      .pipe(
        switchMap((): Observable<Pinnable[]> => {
          return this.httpService
            .get('v1/pinnables/arranged');
        })
      )
      .subscribe((res) => {
        this.pinnables = res;
        console.log(res.map(i => i.id));
      });
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
      const component = OverlayContainerComponent;
      switch (action) {
          case 'newRoom': {
              data = {
                  type: action,
              };
              break;
          }
          case 'newFolder': {
              data = {
                  type: action,
                  pinnables$: this.pinnables$,
                  rooms: this.selectedPinnables,
              };
              break;
          }
          case 'editRoom': {
              data = {
                  type: action,
                  pinnable: this.pinnable,
              };
              break;
          }
          case 'editFolder': {
              data = {
                  type: 'newFolder',
                  pinnable: this.pinnable,
                  pinnables$: this.pinnables$,
                  isEditFolder: true
              };
              break;
          }
          case 'edit': {
              if (this.selectedPinnables.length === 1) {
                  if (this.selectedPinnables[0].type === 'location') {
                      data = {
                          type: 'editRoom',
                          pinnable: this.selectedPinnables[0]
                      };
                      break;
                  }
                  if (this.selectedPinnables[0].type === 'category') {
                      data = {
                          type: 'newFolder',
                          pinnable: this.selectedPinnables[0],
                          pinnables$: this.pinnables$,
                          isEditFolder: true
                      };
                      break;
                  }

              } else {
                  data = {
                      type: action,
                      rooms: this.selectedPinnables,
                  };
                  break;
              }
              break;
          }
          case 'newFolderWithSelections': {
              data = {
                  type: 'newFolder',
                  rooms: this.selectedPinnables,
              };
              break;
          }
      }
      return this.dialogContainer(data, component);
  }

  dialogContainer(data, component) {
     const overlayDialog =  this.dialog.open(component, {
          panelClass: 'overlay-dialog',
          backdropClass: 'custom-bd',
          disableClose: true,
          width: '1018px',
          height: '560px',
          data: data
      });

     overlayDialog.afterClosed()
         .pipe(switchMap(() => this.httpService.get('v1/pinnables/arranged'))).subscribe(res => {
             this.pinnables = res;
             this.selectedPinnables = [];
             this.pinColComponent.clearSelected();
     });
  }
}
