import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../models/User';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HallPassesService} from '../services/hall-passes.service';
import {Observable} from 'rxjs';
import {QuickPreviewPasses} from '../models/QuickPreviewPasses';

@Component({
  selector: 'app-student-info-card',
  templateUrl: './student-info-card.component.html',
  styleUrls: ['./student-info-card.component.scss']
})
export class StudentInfoCardComponent implements OnInit {

  profile: User;

  loadingPassesStats$: Observable<boolean>;
  passesStats$: Observable<QuickPreviewPasses>;

  constructor(
    public dialogRef: MatDialogRef<StudentInfoCardComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private passesService: HallPassesService,
  ) { }

  ngOnInit(): void {
    this.profile = this.data['profile'];
    this.passesService.getQuickPreviewPassesRequest(6, true);
    this.loadingPassesStats$ = this.passesService.quickPreviewPassesLoading$;
    this.passesStats$ = this.passesService.quickPreviewPassesStats$;
  }

}
