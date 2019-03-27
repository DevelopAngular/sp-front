import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';

import {BehaviorSubject, Observable, of, Subscription, zip} from 'rxjs';
import {filter, switchMap, tap} from 'rxjs/operators';

import { HttpService } from '../../services/http-service';
import { Pinnable } from '../../models/Pinnable';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import { PinnableCollectionComponent } from '../pinnable-collection/pinnable-collection.component';
import * as _ from 'lodash';
import { disableBodyScroll } from 'body-scroll-lock';
import { HallPassesService } from '../../services/hall-passes.service';
import {SchoolSettingDialogComponent} from '../school-setting-dialog/school-setting-dialog.component';
import {User} from '../../models/User';
import {Location} from '../../models/Location';
import {ActivatedRoute, Router} from '@angular/router';
import {LocationsService} from '../../services/locations.service';

@Component({
  selector: 'app-pass-congif',
  templateUrl: './pass-config.component.html',
  styleUrls: ['./pass-config.component.scss']
})
export class PassConfigComponent implements OnInit, OnDestroy {

    @ViewChild(PinnableCollectionComponent) pinColComponent;


    public pinnableCollectionBlurEvent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    settingsForm: FormGroup;
    selectedPinnables: Pinnable[];
    pinnable: Pinnable;
    pinnables$: Observable<Pinnable[]>;
    pinnables;
    schools$;

    dataChanges: any[] = [];

    // Needs for OverlayContainer opening if an admin comes from teachers profile card on Accounts&Profiles tab
    private forceSelectedLocation: Location;

  constructor(
      private dialog: MatDialog,
      private httpService: HttpService,
      private hallPassService: HallPassesService,
      private elRef: ElementRef,
      private activatedRoute: ActivatedRoute,
      private locationsService: LocationsService,
      private router: Router

  ) { }

  get schoolName() {
    const school = this.httpService.getSchool();
    return school != null ? school.name : '';
  }

  ngOnInit() {
    disableBodyScroll(this.elRef.nativeElement);



    this.pinnables$ = this.hallPassService.getPinnables();
    // this.schools$ = this.httpService.get('v1/schools');
    // this.schools$.subscribe(res => this.schoolName =  res[0].name);
    this.pinnables$.subscribe(res => this.pinnables = res);

    this.httpService.globalReload$.subscribe(() => {
      this.pinnables$ = this.hallPassService.getPinnables();
      this.pinnables$.subscribe(res => this.pinnables = res);

      const forceSelectPinnable: Subscription = this.activatedRoute.queryParams.pipe(
        filter((qp) => Object.keys(qp).length > 0 && Object.keys(qp).length === Object.values(qp).length),
        switchMap((qp: any): any => {
          const {locationId} = qp;
          this.router.navigate( ['admin/passconfig']);

          // { action: 'room/folder_edit', selection: pinnable }
          return this.locationsService.getLocation(locationId);
          // this.selectPinnable({ action: 'room/folder_edit', selection: pinnable })
        }),
        switchMap((location: Location) => {
          return zip(this.pinnables$, of(location));
        })
      ).subscribe((result) => {
        console.log(result);


        const [pinnables, location] = result;
        this.forceSelectedLocation = location;
        this.pinnable = pinnables.find((pnbl: Pinnable) => pnbl.category === location.category);

        console.log(pinnables, location);

        this.selectPinnable({ action: 'room/folder_edit', selection: this.pinnable });

        forceSelectPinnable.unsubscribe();
      });



    });

  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  onPinnnableBlur(evt) {
    console.log(evt.target.className)
    if (evt.target && (evt.target.className === 'selected-counter global-opacity-icons')) {
      console.log(evt.target);
      this.pinnableCollectionBlurEvent$.next(false);
    } else {
      this.pinnableCollectionBlurEvent$.next(true);
    }
  }

  updatePinnablesOrder(newOrder) {

    const pinnableIdArranged = newOrder.map(pin => pin.id);

    this.hallPassService.createArrangedPinnable({order: pinnableIdArranged.join(',')})
      .pipe(
        switchMap((): Observable<Pinnable[]> => {
          return this.hallPassService.getPinnables();
        })
      )
      .subscribe((res) => {
        this.pinnables = res;
        console.log(res.map(i => i.id));
      });
  }

  openSettings() {
    this.dialog.open(SchoolSettingDialogComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-bd',
    });
  }

  selectPinnable({action, selection}) {
    console.log('Pinnable data ====>', action, selection);
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
          case 'newRoom':
              data = {
                  type: action,
              };
              break;
          case 'newFolder':
              data = {
                  type: action,
                  pinnables$: this.pinnables$,
                  rooms: this.selectedPinnables,
              };
              break;
          case 'editRoom':
              data = {
                  type: action,
                  pinnable: this.pinnable,
              };
              break;
          case 'editFolder':
              data = {
                  type: 'newFolder',
                  pinnable: this.pinnable,
                  pinnables$: this.pinnables$,
                  isEditFolder: true
              };
              if (this.forceSelectedLocation) {
                data.forceSelectedLocation = this.forceSelectedLocation;
              }
              break;
          case 'edit':
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
          case 'newFolderWithSelections':
              data = {
                  type: 'newFolder',
                  rooms: this.selectedPinnables,
              };
              break;
      }
      return this.dialogContainer(data, component);
  }

  dialogContainer(data, component) {
     const overlayDialog =  this.dialog.open(component, {
          panelClass: 'overlay-dialog',
          backdropClass: 'custom-bd',
          disableClose: true,
          width: '750px',
          height: '425px',
          data: data
      });

     overlayDialog.afterOpen().subscribe(() => {
       this.forceSelectedLocation = null;
     });
     overlayDialog.afterClosed()
         .pipe(switchMap(() => this.hallPassService.getPinnables())).subscribe(res => {
             this.pinnables = res;
             this.selectedPinnables = [];
             this.pinColComponent.clearSelected();
     });
  }
}
