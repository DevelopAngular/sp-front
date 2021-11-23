import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {User} from '../../models/User';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {HallPassesService} from '../../services/hall-passes.service';
import {Observable} from 'rxjs';
import {QuickPreviewPasses} from '../../models/QuickPreviewPasses';
import {UserService} from '../../services/user.service';
import {School} from '../../models/School';
import {HallPass} from '../../models/HallPass';
import {map, tap} from 'rxjs/operators';
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';
import {SettingsDescriptionPopupComponent} from '../../settings-description-popup/settings-description-popup.component';

@Component({
  selector: 'app-student-info-card',
  templateUrl: './student-info-card.component.html',
  styleUrls: ['./student-info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentInfoCardComponent implements OnInit {

  profile: User;

  loadingPassesStats$: Observable<boolean>;
  passesStats$: Observable<QuickPreviewPasses>;
  lastStudentPasses$: Observable<HallPass[]>;
  school: School;

  constructor(
    public dialogRef: MatDialogRef<StudentInfoCardComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialog: MatDialog,
    private passesService: HallPassesService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.profile = this.data['profile'];
    this.school = this.userService.getUserSchool();
    this.passesService.getQuickPreviewPassesRequest(6, true);
    this.lastStudentPasses$ = this.passesService.quickPreviewPasses$.pipe(map(passes => passes.map(pass => HallPass.fromJSON(pass))));
    this.loadingPassesStats$ = this.passesService.quickPreviewPassesLoading$;
    this.passesStats$ = this.passesService.quickPreviewPassesStats$;
  }

  openStudentSettings(event) {
    const settings = [
      {
        label: 'Copy private link',
        icon: '',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: ''
      },
      {
        label: 'Edit status',
        icon: './assets/Add Account (White).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: ''
      },
      {
        label: 'Change password',
        icon: './assets/Change Password (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: ''
      },
      {
        label: 'Delete Account',
        icon: './assets/Delete (Red).svg',
        textColor: '#E32C66',
        backgroundColor: '#F4F4F4',
        confirmButton: true,
        description: 'Are you sure?',
        action: ''
      }
    ];
    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: event.currentTarget, settings }
    });

    st.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false))).subscribe();
  }

  openCreatePassPopup(event) {
    const settings = [
      {
        label: 'Create pass for now',
        icon: './assets/Plus (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: ''
      },
      {
        label: 'Schedule pass',
        icon: './assets/Schedule pass (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: ''
      }
    ];
    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: event.currentTarget, settings }
    });

    st.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false))).subscribe();
  }

}
