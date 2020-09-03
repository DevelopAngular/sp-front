import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import {BehaviorSubject, Observable, of, Subject, zip} from 'rxjs';
import {filter, map, switchMap, take, takeUntil, tap, withLatestFrom} from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {bumpIn} from '../../animations';
import {ActivatedRoute, Route, Router} from '@angular/router';
import {Util} from '../../../Util';
import {User} from '../../models/User';
import {StorageService} from '../../services/storage.service';
import {GettingStartedProgressService} from '../getting-started-progress.service';
import {GSuiteOrgs} from '../../models/GSuiteOrgs';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {LocationsService} from '../../services/locations.service';
import {SyncSettingsComponent} from './sync-settings/sync-settings.component';
import {GG4LSync} from '../../models/GG4LSync';
import {SchoolSyncInfo} from '../../models/SchoolSyncInfo';
import {Ggl4SettingsComponent} from './ggl4-settings/ggl4-settings.component';
import {GSuiteSettingsComponent} from './g-suite-settings/g-suite-settings.component';
import {ToastService} from '../../services/toast.service';
import {Onboard} from '../../models/Onboard';
import {XlsxGeneratorService} from '../xlsx-generator.service';
import {TableService} from '../sp-data-table/table.service';
import { xorBy } from 'lodash';

declare const window;

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  animations: [bumpIn]
})
export class AccountsComponent implements OnInit, OnDestroy {

  user: User;
  currentRole: string;

  gg4lSettingsData$: Observable<GG4LSync>;
  schoolSyncInfoData$: Observable<SchoolSyncInfo>;
  selectedUsers = [];

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
    private tableService: TableService
  ) {}

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  ngOnInit() {

    this.onboardProcessLoaded$ = this.adminService.loadedOnboardProcess$;
    this.gg4lSettingsData$ = this.adminService.gg4lInfo$;
    this.schoolSyncInfoData$ = this.adminService.schoolSyncInfo$;

    this.onboardProcess$ = this.http.globalReload$.pipe(
      tap(() => this.adminService.getCountAccountsRequest().pipe(take(1))),
      tap(() => this.adminService.getGG4LSyncInfoRequest()),
      tap(() => this.adminService.getSpSyncingRequest()),
      tap(() => this.adminService.getGSuiteOrgsRequest()),
      switchMap(() => {
        return this.adminService.getOnboardProcessRequest().pipe(filter(res => !!res));
      })
    );

    this.toastService.toastButtonClick$
      .pipe(
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
    });

    this.userService.userData.pipe(
      takeUntil(this.destroy$))
      .subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openSyncSettings() {
    const SS = this.matDialog.open(SyncSettingsComponent, {
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      data: {gg4lInfo: this.gg4lSettingsData$}
    });
  }

  openNewTab(url) {
    window.open(url);
  }

  openSettingsDialog(action, status) {
    if (action === 'gg4l') {
      const gg4l = this.matDialog.open(Ggl4SettingsComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-bd',
        width: '425px',
        height: '500px',
        data: { status }
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
          {title: 'Demo Accounts Added', subtitle: 'Download the account passwords now.'});
      });
  }
}
