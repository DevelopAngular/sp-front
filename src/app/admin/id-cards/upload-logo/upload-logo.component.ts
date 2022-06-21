import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-logo',
  templateUrl: './upload-logo.component.html',
  styleUrls: ['./upload-logo.component.scss']
})
export class UploadLogoComponent {

  imageUrl: string | ArrayBuffer;

  constructor(
    private dialogRef: MatDialogRef<UploadLogoComponent>,
  ) { }

  showPreview(event: any): void {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.imageUrl = reader.result;

        reader.readAsDataURL(file);
    }
}

}
