import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AdminService } from "../../../services/admin.service";
import { BackgroundTextComponent } from "../background-text/background-text.component";
import { UploadLogoComponent } from "../upload-logo/upload-logo.component";
import * as QRCode from "qrcode";
import * as Barcode from "jsbarcode";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-id-card-editor",
  templateUrl: "./id-card-editor.component.html",
  styleUrls: ["./id-card-editor.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class IdCardEditorComponent implements OnInit {
  IDCardBackgroundColor: string = "#00b476";
  backsideText: string = "This is demo backside text";
  IDNumberData: any = {};
  logoURL: string = '';

  selectedCode: string = 'qr-code';
  typeOfBarcodes: any = [
    {title: 'Traditional', value: 'code39', icon: 'barcode'},
    {title: 'QR Code', value: 'qr-code', icon: 'qr_code'},
  ]

  constructor(
    public adminService: AdminService,
    private dialog: MatDialog,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {}

  async setUpProfilePicture() {
    // const result = await this.adminService.getAdminHallPasses().pipe(
    //   map((data) => {
    //     return data;
    //   }),
    //   catchError((error) => of())
    // );
    // console.log("result : ", result);
  }

  addBackgroundText() {
    const dialogRef = this.dialog.open(BackgroundTextComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
      // data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.backsideText = result;
        console.log("result : ", result);
      }
    });
  }

  uploadLogo() {
    const dialogRef = this.dialog.open(UploadLogoComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
      // data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("result : ", result);
        this.logoURL = result;
      }
    });
  }

  setUpIDNumber() {
    this.IDNumberData["idNumber"] = Math.floor(100000 + Math.random() * 900000);
    this.changeClient("qr-code");
  }

  changeClient(value) {
    console.log("Value : ", value);
    if (value == "qr-code") {
      QRCode.toDataURL(this.IDNumberData.idNumber.toString())
        .then((url) => {
          this.IDNumberData["url"] = url;
          console.log(url);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      const svgNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      const xmlSerializer = new XMLSerializer();
      Barcode(svgNode, this.IDNumberData.idNumber.toString(), {
        format: "CODE39",
        width: 1,
        height: 50,
        displayValue: false,
      });
      const svgText = xmlSerializer.serializeToString(svgNode);
      var dataURL = "data:image/svg+xml," + encodeURIComponent(svgText);
      this.IDNumberData["url"] =
        this.domSanitizer.bypassSecurityTrustUrl(dataURL);
    }
  }
}
