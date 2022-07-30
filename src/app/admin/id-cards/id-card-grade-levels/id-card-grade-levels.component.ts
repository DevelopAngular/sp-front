import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-id-card-grade-levels',
  template: `<app-grade-levels [page]="2" (backEmit)="dialogRef.close()"></app-grade-levels>`,
  styleUrls: ['./id-card-grade-levels.component.scss']
})
export class IdCardGradeLevelsComponent implements OnInit {

  isUploadedGradeLevels: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<IdCardGradeLevelsComponent>,
    // private userService: UserService,
  ) { }

  ngOnInit(): void {
    // this.userService.getStatusOfGradeLevel().subscribe({
    //   next: (result: any) => {
    //     if (result?.results?.setup) {
    //       this.isUploadedGradeLevels = result?.results?.setup;

    //       console.log("this.isUploadedGradeLevels : ", this.isUploadedGradeLevels)
    //     }
    //   }
    // });
  }

}
