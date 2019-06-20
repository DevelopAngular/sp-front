import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormGroup } from '@angular/forms';

import {BehaviorSubject, forkJoin, Observable, of, Subscription, zip} from 'rxjs';
import {filter, finalize, mapTo, switchMap} from 'rxjs/operators';

import { HttpService } from '../../services/http-service';
import { Pinnable } from '../../models/Pinnable';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import { PinnableCollectionComponent } from '../pinnable-collection/pinnable-collection.component';
import * as _ from 'lodash';
import { HallPassesService } from '../../services/hall-passes.service';
import {SchoolSettingDialogComponent} from '../school-setting-dialog/school-setting-dialog.component';
import {Location} from '../../models/Location';
import {ActivatedRoute, Router} from '@angular/router';
import {LocationsService} from '../../services/locations.service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {ConsentMenuComponent} from '../../consent-menu/consent-menu.component';
import {AdminService} from '../../services/admin.service';

@Component({
  selector: 'app-pass-congif',
  templateUrl: './pass-config.component.html',
  styleUrls: ['./pass-config.component.scss']
})
export class PassConfigComponent implements OnInit, OnDestroy {

    @ViewChild(PinnableCollectionComponent) pinColComponent;


    public pinnableCollectionBlurEvent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    settingsForm: FormGroup;
    selectedPinnables: Pinnable[] = [];
    pinnable: Pinnable;
    pinnables$: Observable<Pinnable[]>;
    pinnables: Pinnable[] = [];
    schools$;

    buttonMenuOpen: boolean;
    bulkSelect: boolean;

    // Needs for OverlayContainer opening if an admin comes from teachers profile card on Accounts&Profiles tab
    private forceSelectedLocation: Location;

    showRooms: boolean;
    onboardLoaded: boolean;

  constructor(
      private dialog: MatDialog,
      private httpService: HttpService,
      private hallPassService: HallPassesService,
      private elRef: ElementRef,
      private activatedRoute: ActivatedRoute,
      private locationsService: LocationsService,
      private router: Router,
      public darkTheme: DarkThemeSwitch,
      private adminService: AdminService,


  ) { }

  get schoolName() {
    const school = this.httpService.getSchool();
    return school != null ? school.name : '';
  }

  get headerButtonText() {
    return (this.selectedPinnables.length < 1 || !this.bulkSelect ? 'Add' : 'Bulk Edit Rooms');
  }

  get headerButtonIcon() {
    return (this.selectedPinnables.length < 1 || !this.bulkSelect ? './assets/Plus (White).svg' : null);
  }

  ngOnInit() {
    this.adminService.getOnboardProgress().subscribe((onboard: any[]) => {
        console.log('Onboard ==>>>>', onboard);
        const end = onboard.find(item => item.name === 'setup_rooms:end');
        this.showRooms = end.done;
        this.onboardLoaded = true;
    });
    this.pinnables$ = this.hallPassService.getPinnables();
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
      ).subscribe(([pinnables, location]) => {
        this.forceSelectedLocation = location;
        this.pinnable = pinnables.find((pnbl: Pinnable) => {
            if (pnbl.type === 'location') {
                return pnbl.location.id === location.id;
            } else {
                return pnbl.category === location.category;
            }
        });

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

    toggleBulk() {
        this.bulkSelect = !this.bulkSelect;
        this.selectedPinnables = [];
    }

    buttonClicked(evnt: MouseEvent) {
        if (!this.buttonMenuOpen) {
            const target = new ElementRef(evnt.currentTarget);
            let options = [];

            if(this.selectedPinnables.length > 0 && this.bulkSelect){
                options.push(this.genOption('Bulk Edit Selection', this.darkTheme.getColor(), 'edit'));
                options.push(this.genOption('New Folder with Selection', this.darkTheme.getColor(), 'newFolder'));
                // options.push(this.genOption('Delete Selection','#E32C66','delete'));
            } else{
                options.push(this.genOption('New Room', this.darkTheme.getColor(), 'newRoom'));
                options.push(this.genOption('New Folder', this.darkTheme.getColor(), 'newFolder'));
            }

            const cancelDialog = this.dialog.open(ConsentMenuComponent, {
                panelClass: 'consent-dialog-container',
                backdropClass: 'invis-backdrop',
                data: {'header': '', 'options': options, 'trigger': target}
            });

            cancelDialog.afterOpen().subscribe( () => {
                this.buttonMenuOpen = true;
            });

            cancelDialog.afterClosed().subscribe(action => {
                this.buttonMenuOpen = false;
                if (action === 'delete') {
                    // const currentPinIds = this.selectedPinnables.map(pinnable => pinnable.id);
                    // this.pinnables = this.pinnables.filter(pinnable => pinnable.id !== currentPinIds.find(id => id === pinnable.id));
                    // const pinnableToDelete = this.selectedPinnables.map(pinnable => {
                    //     return this.hallPassService.deletePinnable(pinnable.id);
                    // });
                    // return forkJoin(pinnableToDelete).subscribe(() => this.toggleBulk());
                } else {
                    if (action) {
                        console.log('[Pinnable Collection, Dialog]:', action, ' --- ', this.selectedPinnables);
                        this.selectPinnable({action, selection: this.selectedPinnables});
                        // this.roomEvent.emit({'action': action, 'selection': this.selectedPinnables});
                    }
                }
            });

        }
    }

    genOption(display, color, action) {
        return {display: display, color: color, action: action};
    }

  selectPinnable({action, selection}) {
      if (action === 'room/folder_edit' && !_.isArray(selection)) {
          this.pinnable = selection;
        return this.buildData(this.pinnable.type === 'location' ? 'editRoom' : 'editFolder');
      } else if (action === 'simple') {
          this.selectedPinnables = selection;
      } else {
          this.selectedPinnables = selection;
          this.buildData(action);
      }
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
          minWidth: '800px',
          maxWidth: '100vw',
          width: '800px',
          height: '500px',
          data: data
      });

     overlayDialog.afterOpen().subscribe(() => {
       this.forceSelectedLocation = null;
     });
     overlayDialog.afterClosed()
         .pipe(switchMap(() => this.hallPassService.getPinnables())).subscribe(res => {
             this.pinnables = res;
             this.selectedPinnables = [];
             this.bulkSelect = false;
     });
  }

  onboard({createPack, pinnables}) {
      if (createPack) {
          const requests$ = pinnables.map(pin => {
                  const location =  {
                      title: pin.title,
                      room: pin.room,
                      restricted: pin.restricted,
                      scheduling_restricted: pin.scheduling_restricted,
                      travel_types: pin.travel_types,
                      max_allowed_time: pin.max_allowed_time
                  };
                  return this.locationsService.createLocation(location)
                      .pipe(switchMap((loc: Location) => {
                          const pinnable = {
                              title: pin.title,
                              color_profile: pin.color_profile_id,
                              icon: pin.icon,
                              location: loc.id,
                          };
                          return this.hallPassService.createPinnable(pinnable);
                      }));
          });

          forkJoin(requests$)
              .pipe(switchMap((res) => {
                    return this.adminService.updateOnboardProgress('setup_rooms:end').pipe(mapTo(res));
                }))
              .subscribe((res: Pinnable[]) => {
              this.pinnables.push(...res);
              this.showRooms = true;
          });
      } else {
          this.showRooms = true;
      }
  }
}
