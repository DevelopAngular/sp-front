import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {interval, Observable, Subject} from 'rxjs';
import {filter, switchMap, takeUntil } from 'rxjs/operators';
import { HttpService } from '../../services/http-service';
import {AdminService} from '../../services/admin.service';
import {ScrollPositionService} from '../../scroll-position.service';
import {Onboard} from '../../models/Onboard';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  private scrollableAreaName = 'Dashboard';
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

  public onboardProgress$: Observable<{ [id: string]: Onboard }>;
  public onboardProcessLoaded$: Observable<boolean>;

  constructor(
    private http: HttpService,
    private adminService: AdminService,
    private scrollPosition: ScrollPositionService,
  ) {
  }

  ngOnInit() {
    this.onboardProcessLoaded$ = this.adminService.loadedOnboardProcess$;
    this.onboardProgress$ = this.http.globalReload$
      .pipe(
        switchMap(() => {
          return this.adminService.getOnboardProcessRequest();
        })
      );
  }

  showStartPage(progress: { [id: string]: Onboard }): boolean {
    return progress && !progress['2.landing:first_room'].done || !progress['2.landing:first_account'].done;
  }

  ngOnDestroy() {
    this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
  }
}
