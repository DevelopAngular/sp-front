import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-id-card-id-numbers',
  template: `<app-id-numbers [page]="2" (backEmit)="dialogRef.close()"></app-id-numbers>`,
  styleUrls: ['./id-card-id-numbers.component.scss']
})
export class IdCardIdNumbersComponent implements OnInit {

  isUploadedIDNumbers: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<IdCardIdNumbersComponent>,
    // private userService: UserService,
  ) { }

  ngOnInit(): void {
    // this.userService.getStatusOfIDNumber().subscribe({
    //   next: (result: any) => {
    //     if (result?.results?.setup) {
    //       this.isUploadedIDNumbers = result?.results?.setup;
    //     }
    //   }
    // })
  }

}
