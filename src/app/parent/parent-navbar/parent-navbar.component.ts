import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UNANIMATED_CONTAINER } from '../../consent-menu-overlay';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { User } from '../../models/User';
import { NavbarAnimations } from '../../navbar/navbar.animations';
import { RepresentedUser } from '../../navbar/navbar.component';
import { ParentAccountService } from '../../services/parent-account.service';
import { ScreenService } from '../../services/screen.service';
import { SideNavService } from '../../services/side-nav.service';
import { SettingsComponent } from '../../settings/settings.component';
import { ParentSettingComponent } from '../parent-setting/parent-setting.component';

@Component({
  selector: 'app-parent-navbar',
  templateUrl: './parent-navbar.component.html',
  styleUrls: ['./parent-navbar.component.scss'],
  animations: [
    NavbarAnimations.inboxAppearance,
    NavbarAnimations.arrowAppearance,
  ],
})
export class ParentNavbarComponent implements OnInit {

  @Input() hasNav = true;

  user: User;
  representedUsers: RepresentedUser[];
  effectiveUser: RepresentedUser;
  isOpenSettings: boolean;
  showSwitchButton: boolean = false;

  private destroyer$ = new Subject<any>();

  @ViewChild("navbar") navbar: ElementRef;
  // @ViewChild("navButtonsContainerMobile") navButtonsContainerMobile: ElementRef;
  @ViewChild("setButton") settingsButton: ElementRef;
  @Output() settingsClick: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public darkTheme: DarkThemeSwitch,
    public parentService: ParentAccountService,
    public screenService: ScreenService,
    public sideNavService: SideNavService,
    public dialog: MatDialog,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.parentService.getParentInfo().subscribe({
      next: (result: any) => {
        this.user = result;
      },
      error: (error: any) => {
        console.log("Error : ", error)

      }
    });

    this.sideNavService.sideNavAction
      .pipe(takeUntil(this.destroyer$))
      .subscribe((action) => {
        this.settingsAction(action);
      });

    this.sideNavService.openSettingsEvent$
      .pipe(
        filter((r) => !!r),
        takeUntil(this.destroyer$)
      )
      .subscribe((res) => this.showOptions(this.settingsButton));
  }

  showOptions(event) {
    if (!this.isOpenSettings) {
      if (this.screenService.isDeviceLargeExtra) {
        this.sideNavService.toggle$.next(true);
        this.sideNavService.toggleLeft$.next(true);
      }

      const target = new ElementRef(event.currentTarget);
      if (!this.screenService.isDeviceLargeExtra) {
        this.isOpenSettings = true;
        UNANIMATED_CONTAINER.next(true);
        const settingRef = this.dialog.open(SettingsComponent, {
          panelClass: ["calendar-dialog-container", "animation"],
          backdropClass: "invis-backdrop",
          data: { trigger: target, isSwitch: this.showSwitchButton },
        });

        settingRef.afterClosed().subscribe((action) => {
          UNANIMATED_CONTAINER.next(false);
          this.isOpenSettings = false;
          this.settingsAction(action);
        });
      }

      this.settingsClick.emit({
        trigger: target,
        isSwitch: this.showSwitchButton,
      });

      this.sideNavService.sideNavData$.next({
        trigger: target,
        isSwitch: this.showSwitchButton,
      });

      this.sideNavService.sideNavType$.next("left");
    }
  }

  settingsAction(action: string) {
    if (action === "signout") {
      this.router.navigate(["sign-out"]);
    }
  }

}
