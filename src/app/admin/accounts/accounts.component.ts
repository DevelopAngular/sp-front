import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpService} from '../../services/http-service';
import {UserService} from '../../services/user.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {AdminService} from '../../services/admin.service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {bumpIn} from '../../animations';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Util} from '../../../Util';
import {User} from '../../models/User';
import {StorageService} from '../../services/storage.service';
import {GettingStartedProgressService} from '../getting-started-progress.service';
import {GSuiteOrgs} from '../../models/GSuiteOrgs';
import {DomSanitizer} from '@angular/platform-browser';
import {LocationsService} from '../../services/locations.service';
import {GG4LSync} from '../../models/GG4LSync';
import {SchoolSyncInfo} from '../../models/SchoolSyncInfo';
import {Ggl4SettingsComponent} from './ggl4-settings/ggl4-settings.component';
import {GSuiteSettingsComponent} from './g-suite-settings/g-suite-settings.component';
import {ToastService} from '../../services/toast.service';
import {Onboard} from '../../models/Onboard';
import {XlsxGeneratorService} from '../xlsx-generator.service';
import {TableService} from '../sp-data-table/table.service';
import {CleverInfo} from '../../models/CleverInfo';
import {PollingService} from '../../services/polling-service';

declare const window;

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  animations: [bumpIn]
})
export class AccountsComponent implements OnInit, OnDestroy {

  user: User;

  gg4lSettingsData$: Observable<GG4LSync>;
  schoolSyncInfoData$: Observable<SchoolSyncInfo>;
  cleverSyncInfo$: Observable<CleverInfo>;
  prevRoute: string;

  destroy$ = new Subject();

  gSuiteOrgs$: Observable<GSuiteOrgs> = of({});

  currentPage: string;

  onboardProcess$: Observable<{[id: string]: Onboard}>;
  onboardProcessLoaded$: Observable<boolean>;

  public dataTableEditState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public pending$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private userService: UserService,
    private http: HttpService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    private storage: StorageService,
    public matDialog: MatDialog,
    private gsProgress: GettingStartedProgressService,
    private domSanitizer: DomSanitizer,
    private locationService: LocationsService,
    private toastService: ToastService,
    private xlsxGeneratorService: XlsxGeneratorService,
    private tableService: TableService,
    private polingService: PollingService
  ) {}

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  ngOnInit() {

    this.onboardProcessLoaded$ = this.adminService.loadedOnboardProcess$;
    this.gg4lSettingsData$ = this.adminService.gg4lInfo$;
    this.schoolSyncInfoData$ = this.adminService.schoolSyncInfo$;
    this.cleverSyncInfo$ = this.adminService.cleverInfoData$;

    this.onboardProcess$ = this.http.globalReload$.pipe(
      tap(() => this.adminService.getCountAccountsRequest().pipe(take(1))),
      tap(() => this.adminService.getGG4LSyncInfoRequest()),
      tap(() => this.adminService.getSpSyncingRequest()),
      tap(() => this.adminService.getGSuiteOrgsRequest()),
      tap(() => this.adminService.getCleverInfoRequest()),
      switchMap(() => {
        return this.adminService.getOnboardProcessRequest().pipe(filter(res => !!res));
      })
    );
    if (this.storage.getItem('accounts_current_page')) {
      this.router.navigate([this.storage.getItem('accounts_current_page')]);
    }


    this.polingService.listen('admin.user_sync.sync_start').pipe(takeUntil(this.destroy$))
      .subscribe(res => {
      this.adminService.syncLoading();
    });

    this.polingService.listen('admin.user_sync.sync_end').pipe(takeUntil(this.destroy$))
      .subscribe(res => {
      this.adminService.updateCleverInfo(res.data);
    });

    this.toastService.toastButtonClick$
      .pipe(
        filter(action => action === 'demo_accounts_down'),
        tap(() => this.tableService.loadingCSV$.next(true)),
        switchMap(() => {
          return this.onboardProcess$;
        }),
        map((onboard) => {
          return onboard['2.accounts:create_demo_accounts'].extras.accounts;
        }),
        take(1),
        map(accounts => {
          return accounts.map(account => {
            return {
              'Role': account.type,
              'Username': account.username,
              'Password': account.password
            };
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        this.xlsxGeneratorService.generate(res);
        // this.tableService.loadingCSV$.next(false);
    });

    this.userService.user$.pipe(
      takeUntil(this.destroy$))
      .subscribe((user) => {
      this.user = user;
    });

    this.router.events
      .pipe(takeUntil(this.destroy$), filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/admin/accounts' &&
          (this.prevRoute === `/admin/accounts/_profile_student` ||
            this.prevRoute === `/admin/accounts/_profile_teacher` ||
            this.prevRoute === `/admin/accounts/_profile_admin` ||
            this.prevRoute === `/admin/accounts/_profile_assistant`)) {
          this.router.navigate([this.prevRoute]);
        } else {
          this.prevRoute = event.url;
          this.storage.setItem('accounts_current_page', event.url);
        }

      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openSettingsDialog(action, status) {
    if (action === 'gg4l' || action === 'clever') {
      const gg4l = this.matDialog.open(Ggl4SettingsComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-bd',
        width: '425px',
        height: '500px',
        data: { status, action }
      });
    } else if (action === 'g_suite') {
      const g_suite = this.matDialog.open(GSuiteSettingsComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-bd',
        width: '425px',
        height: '500px',
      });
    }
  }

  openBulkUpload() {
    this.adminService.updateOnboardProgressRequest('2.accounts:create_demo_accounts');
    this.onboardProcessLoaded$.pipe(
      filter(res => !!res),
      takeUntil(this.destroy$)
    )
      .subscribe(() => {
        this.adminService.getCountAccountsRequest();
        this.toastService.openToast(
          {title: 'Demo Accounts Added', subtitle: 'Download the account passwords now.', action: 'demo_accounts_down'});
      });
  }
}
