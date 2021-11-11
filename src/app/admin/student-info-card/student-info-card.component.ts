import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {User} from '../../models/User';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HallPassesService} from '../../services/hall-passes.service';
import {Observable} from 'rxjs';
import {QuickPreviewPasses} from '../../models/QuickPreviewPasses';
import {UserService} from '../../services/user.service';
import {School} from '../../models/School';
import {HallPass} from '../../models/HallPass';
import {map} from 'rxjs/operators';

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

}
