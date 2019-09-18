import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormGroup } from '@angular/forms';

import {BehaviorSubject, combineLatest, forkJoin, iif, interval, Observable, of, ReplaySubject, Subject, Subscription, zip} from 'rxjs';
import {delay, filter, finalize, map, mapTo, switchMap, takeUntil, tap} from 'rxjs/operators';

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
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';
import {ScrollPositionService} from '../../scroll-position.service';

@Component({
  selector: 'app-pass-congif',
  templateUrl: './pass-config.component.html',
  styleUrls: ['./pass-config.component.scss']
})
export class PassConfigComponent implements OnInit, OnDestroy {


  private scrollableAreaName = 'PassConfig';
  private scrollableArea: HTMLElement;

  @ViewChild('scrollableArea') set scrollable(scrollable: ElementRef) {
    if (scrollable) {
      this.scrollableArea = scrollable.nativeElement;

      const updatePosition = function () {

        const scrollObserver = new Subject();
        const initialHeight = this.scrollableArea.scrollHeight;
        const scrollOffset = this.scrollPosition.getComponentScroll(this.scrollableAreaName);

        /**
         * If the scrollable area has static height, call `scrollTo` immediately,
         * otherwise additional subscription will perform once if the height changes
         */

        if (scrollOffset) {
          this.scrollableArea.scrollTo({top: scrollOffset});
        }

        interval(50)
          .pipe(
            filter(() => {
              return initialHeight < ((scrollable.nativeElement as HTMLElement).scrollHeight) && scrollOffset;
            }),
            takeUntil(scrollObserver)
          )
          .subscribe((v) => {
            console.log(scrollOffset);
            if (v) {
              this.scrollableArea.scrollTo({top: scrollOffset});
              scrollObserver.next();
              scrollObserver.complete();
              updatePosition();
            }
          });
      }.bind(this);
      updatePosition();
    }
  }

    @ViewChild(PinnableCollectionComponent) pinColComponent;


    public pinnableCollectionBlurEvent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private pendingSubject = new ReplaySubject<boolean>(1);
    public pending$ = this.pendingSubject.asObservable();

    selectedPinnables: Pinnable[] = [];
    pinnable: Pinnable;
    pinnables$: Observable<Pinnable[]>;
    pinnables: Pinnable[] = [];

    arrangedOrderForUpdating: number[];

    buttonMenuOpen: boolean;
    bulkSelect: boolean;

    // // Needs for OverlayContainer opening if an admin comes from teachers profile card on Accounts&Profiles tab
    private forceSelectedLocation: Location;

    private onboardUpdate$ = new Subject();

    public loading$: Observable<boolean>;
    public loaded$: Observable<boolean>;

    destroy$ = new Subject();


    showRooms: boolean;
    onboardLoaded: boolean;

  constructor(
      private dialog: MatDialog,
      private httpService: HttpService,
      public hallPassService: HallPassesService,
      private elRef: ElementRef,
      private activatedRoute: ActivatedRoute,
      private locationsService: LocationsService,
      private router: Router,
      public darkTheme: DarkThemeSwitch,
      private adminService: AdminService,
      private scrollPosition: ScrollPositionService


  ) { }

  get headerButtonText() {
    return (this.selectedPinnables.length < 1 || !this.bulkSelect ? 'Add' : 'Bulk Edit Rooms');
  }

  get headerButtonIcon() {
    return (this.selectedPinnables.length < 1 || !this.bulkSelect ? './assets/Plus (White).svg' : null);
  }

  ngOnInit() {
    this.loading$ = this.hallPassService.isLoadingPinnables$;
    this.loaded$ = this.hallPassService.loadedPinnables$;
    this.httpService.globalReload$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          this.pinnables$ = this.hallPassService.getPinnablesRequest();
          return this.pinnables$.pipe(filter((res: any[]) => !!res.length));
        }),
        switchMap((res) => {
          this.pinnables = res;
          return combineLatest(
            this.adminService.getOnboardProcessRequest().pipe(filter((r: any[]) => !!r.length)),
            this.pinnables$
          ).pipe(
              filter(() => navigator.onLine)
            );
        }),
        map(([onboard, pinnables]) => {
          if (onboard && (onboard as any[]).length && !pinnables.length) {
            const end = (onboard as any[]).find(item => item.name === 'setup_rooms:end');
            this.showRooms = !!end.done;
          } else {
              const start = (onboard as any[]).find(item => item.name === 'setup_rooms:start');
              const end = (onboard as any[]).find(item => item.name === 'setup_rooms:end');
              if (!start.done) {
                  this.onboardUpdate$.next('setup_rooms:start');
              }
              if (!end.done) {
                  this.onboardUpdate$.next('setup_rooms:end');
              }
              this.showRooms = true;
          }
          this.onboardLoaded = true;
          return pinnables;
        }),
      switchMap((pinnables) => {
        return this.onboardUpdate$.pipe(
          filter(() => navigator.onLine),
          switchMap((action) => {
            return this.adminService.updateOnboardProgress(action);
          }));
      })).subscribe();

    this.activatedRoute.queryParams.pipe(
      filter((qp) => Object.keys(qp).length > 0 && Object.keys(qp).length === Object.values(qp).length),
      takeUntil(this.destroy$),
      switchMap((qp: any): any => {
        const {locationId} = qp;
        this.router.navigate( ['admin/passconfig']);
        return this.locationsService.getLocation(locationId);
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
    });
  }

  ngOnDestroy() {
    this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
    of(null)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          if (this.arrangedOrderForUpdating && this.arrangedOrderForUpdating.length) {
            return this.updatePinnablesOrder();
          }
          return this.hallPassService.getPinnablesRequest();
        })
      )
      .subscribe(res => {
        this.dialog.closeAll();
      });
    this.destroy$.next();
    this.destroy$.complete();
  }

  // onPinnnableBlur(evt) {
  //   console.log(evt.target.className)
  //   if (evt.target && (evt.target.className === 'selected-counter global-opacity-icons')) {
  //     console.log(evt.target);
  //     this.pinnableCollectionBlurEvent$.next(false);
  //   } else {
  //     this.pinnableCollectionBlurEvent$.next(true);
  //   }
  // }

  setNewArrangedOrder(newOrder) {
    this.arrangedOrderForUpdating = newOrder.map(pin => pin.id);
  }

  private updatePinnablesOrder() {
    return this.hallPassService
      .createArrangedPinnable({order: this.arrangedOrderForUpdating.join(',')})
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.arrangedOrderForUpdating = null),
        switchMap((): Observable<Pinnable[]> => {
          return this.hallPassService.getPinnablesRequest();
        })
      );
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

            UNANIMATED_CONTAINER.next(true);

            const cancelDialog = this.dialog.open(ConsentMenuComponent, {
                panelClass: 'consent-dialog-container',
                backdropClass: 'invis-backdrop',
                data: {'header': '', 'options': options, 'trigger': target}
            });

            cancelDialog.afterOpen().subscribe( () => {
                this.buttonMenuOpen = true;
            });

            cancelDialog.afterClosed()
              .pipe(tap(() => UNANIMATED_CONTAINER.next(false)))
              .subscribe(action => {
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
     .pipe(
       switchMap(() => {
         this.pendingSubject.next(true);
         if (this.arrangedOrderForUpdating && this.arrangedOrderForUpdating.length) {
           return of(null);
         }
         return of(null);
       })
     )
     .subscribe(res => {
       // console.log(res.map(i => i.id));
       // this.pinnables = res;
       this.selectedPinnables = [];
       this.bulkSelect = false;
       this.pendingSubject.next(false);
     });
  }

  onboard({createPack, pinnables}) {
    // console.log(createPack, pinnables);
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
        return this.locationsService.createLocation(location).pipe(filter(() => navigator.onLine))
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
        .pipe(
          filter(() => navigator.onLine),
          takeUntil(this.destroy$),
          switchMap((res) => {
            return this.adminService.updateOnboardProgress('setup_rooms:end').pipe(mapTo(res));
          })
        )
        .subscribe((res: Pinnable[]) => {
          this.pinnables.push(...res);
          this.showRooms = true;
        });
      } else {
        this.adminService.updateOnboardProgress('setup_rooms:end').pipe(filter(() => navigator.onLine))
          .subscribe(() => {

            this.showRooms = true;

          });
      }
  }
}
