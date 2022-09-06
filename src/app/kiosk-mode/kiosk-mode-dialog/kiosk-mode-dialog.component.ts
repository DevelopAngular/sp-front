import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KioskModeService } from '../../services/kiosk-mode.service';

@Component({
  selector: 'app-kiosk-mode-dialog',
  templateUrl: './kiosk-mode-dialog.component.html',
  styleUrls: ['./kiosk-mode-dialog.component.scss']
})
export class KioskModeDialogComponent implements OnInit {

  loginInfoForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<KioskModeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private kioskMode: KioskModeService,
  ) { }

  ngOnInit(): void {
    this.loginInfoForm = new FormGroup({
      username: new FormControl({value: this.data.loginData.username, disabled: true}),
      password: new FormControl({value: this.data.loginData.password, disabled: true})
    });
    console.log("data : ", this.data);
  }

  fetchLoginData(){
    
  }

  resetPassword(){
    console.log("Clicked")
    this.kioskMode.resetPassword(this.data.selectedRoom).subscribe({
      next: (result: any) => {
        this.loginInfoForm = new FormGroup({
          username: new FormControl({value: result.results.username, disabled: true}),
          password: new FormControl({value: result.results.password, disabled: true})
        });
      }
    })
  }

  back() {
      this.dialogRef.close();
  }

}
