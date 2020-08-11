import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';

import {BehaviorSubject, combineLatest, forkJoin, interval, Observable, of, ReplaySubject, Subject, zip} from 'rxjs';
import {concatMap, filter, map, mapTo, share, switchMap, take, takeUntil, tap} from 'rxjs/operators';

import { HttpService } from '../../services/http-service';
import { Pinnable } from '../../models/Pinnable';
import { OverlayContainerComponent } from '../overlay-container/overlay-container.component';
import { PinnableCollectionComponent } from '../pinnable-collection/pinnable-collection.component';
import { isArray } from 'lodash';
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
import {Onboard} from '../../models/Onboard';
import {SupportService} from '../../services/support.service';

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
            // console.log(scrollOffset);
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
    onboardProcess$: Observable<{[id: string]: Onboard}>;
    onboardLoading$: Observable<boolean>;

    arrangedOrderForUpdating: number[];

    buttonMenuOpen: boolean;
    bulkSelect: boolean;

    // // Needs for OverlayContainer opening if an admin comes from teachers profile card on Accounts&Profiles tab
    private forceSelectedLocation: Location;

    private isLoadingArranged$: Observable<boolean>;

    public loading$: Observable<boolean>;
    public loaded$: Observable<boolean>;

    destroy$ = new Subject();
    showRooms: boolean;

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
      private scrollPosition: ScrollPositionService,
      private supportService: SupportService
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
    this.isLoadingArranged$ = this.hallPassService.isLoadingArranged$;
    this.onboardLoading$ = this.adminService.loadingOnboardProcess$;

    this.httpService.globalReload$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.onboardProcess$ = this.adminService.getOnboardProcessRequest().pipe(filter(res => !!res))),
        switchMap((res) => {
          return this.pinnables$ = this.hallPassService.getPinnablesRequest().pipe(
            filter((r: Pinnable[]) => !!r.length));
        }),
        map((pinnables) => {
          this.pinnables = pinnables;
        }),
      ).subscribe();

    this.activatedRoute.queryParams.pipe(
      filter((qp) => Object.keys(qp).length > 0 && Object.keys(qp).length === Object.values(qp).length),
      takeUntil(this.destroy$),
      switchMap((qp: any): any => {
        const {locationId} = qp;
        this.router.navigate( ['admin/passconfig']);
        return this.locationsService.getLocation(locationId);
      }),
      switchMap((location: Location) => {
        return zip(this.pinnables$.pipe(filter(res => !!res.length)), of(location));
      })
    ).subscribe(([pinnables, location]) => {
      this.forceSelectedLocation = location;
      this.pinnable = pinnables.find((pnbl: Pinnable) => {
        if (pnbl.type === 'location') {
          return (pnbl.location.id + '') === (location.id + '');
        } else {
          return pnbl.category === location.category.substring(0, location.category.length - 8);
        }
      });

      this.selectPinnable({ action: 'room/folder_edit', selection: this.pinnable });
    });
  }

  ngOnDestroy() {
    this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
    this.destroy$.next();
    this.destroy$.complete();
  }

  setNewArrangedOrder(newOrder) {
    this.arrangedOrderForUpdating = newOrder.map(pin => pin.id);
    this.updatePinnablesOrder().subscribe();
  }

  private updatePinnablesOrder() {
    return this.isLoadingArranged$.pipe(
      take(1),
      switchMap(value => {
        if (!value) {
          return this.hallPassService
            .createArrangedPinnableRequest({order: this.arrangedOrderForUpdating.join(',')});
        } else {
          return of(null);
        }
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

            if(this.selectedPinnables.length > 0 && this.bulkSelect) {
                options.push(
                  this.genOption('Bulk Edit Selection',
                    this.darkTheme.getColor({dark: '#FFFFFF', white: '#7f879d'}),
                    'edit',
                  )
                );
                options.push(this.genOption('New Folder with Selection', this.darkTheme.getColor({dark: '#FFFFFF', white: '#7f879d'}), 'newFolder'));
            } else {
                options.push(this.genOption('New Room', this.darkTheme.getColor({dark: '#FFFFFF', white: '#7f879d'}), 'newRoom', this.darkTheme.getIcon({iconName: 'Room', darkFill: 'White', lightFill: 'Blue-Gray'})));
                options.push(this.genOption('New Folder', this.darkTheme.getColor({dark: '#FFFFFF', white: '#7f879d'}), 'newFolder', this.darkTheme.getIcon({iconName: 'New Folder', darkFill: 'White', lightFill: 'Blue-Gray'})));
            }

            UNANIMATED_CONTAINER.next(true);

            const cancelDialog = this.dialog.open(ConsentMenuComponent, {
                panelClass: 'consent-dialog-container',
                backdropClass: 'invis-backdrop',
                data: {'options': options, 'trigger': target}
            });

            cancelDialog.afterOpen().subscribe( () => {
                this.buttonMenuOpen = true;
            });

            cancelDialog.afterClosed()
              .pipe(tap(() => UNANIMATED_CONTAINER.next(false)))
              .subscribe(action => {
                this.buttonMenuOpen = false;
                if (action) {
                    this.selectPinnable({action, selection: this.selectedPinnables});
                }
            });

        }
    }

    genOption(display, color, action, icon?) {
      return { display, color, action, icon };
    }

  selectPinnable({action, selection}) {
      if (action === 'room/folder_edit' && !isArray(selection)) {
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
        // .pipe(
        //   switchMap((res) => {
        //     if (res) {
        //       return this.hallPassService.getPinnablesRequest();
        //     }
        //     return of(null);
        //   }),
        // )
        .subscribe(res => {
          this.selectedPinnables = [];
          this.bulkSelect = false;
          this.pendingSubject.next(false);
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
        return this.locationsService.createLocation(location);
      });

      forkJoin(requests$)
        .pipe(
          switchMap((locations: Location[]) => {
            const pinnables$ = locations.map((location: Location, index) => {
              const pinnable = {
                title: pinnables[index].title,
                color_profile: pinnables[index].color_profile_id,
                icon: pinnables[index].icon,
                location: location.id,
              };
              return this.hallPassService.createPinnable(pinnable);
            });
            return forkJoin(pinnables$);
          }),
          filter(() => navigator.onLine),
          takeUntil(this.destroy$),
          switchMap((res) => {
            const order = res.map((v: any) => v.id).join(',');
            return this.hallPassService.createArrangedPinnable({order});
          }),
          take(1),
          switchMap((res) => {
            return this.hallPassService.getPinnables();
          }),
        )
        .subscribe((res: Pinnable[]) => {
          this.pinnables.push(...res);
        });
        this.adminService.updateOnboardProgressRequest('2.landing:first_room');
      } else {
        this.showRooms = true;
    }
  }

  openChat(event) {
    this.supportService.openChat(event);
  }

  closeChat(event) {
    this.supportService.closeChat(event);
  }
}
