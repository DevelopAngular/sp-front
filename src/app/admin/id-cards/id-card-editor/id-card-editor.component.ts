import { Component, ErrorHandler, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { merge, of, ReplaySubject, Subject } from "rxjs";
import { filter, takeUntil, tap } from "rxjs/operators";
import { AdminService } from "../../../services/admin.service";
import { BackgroundTextComponent } from "../background-text/background-text.component";
import { UploadLogoComponent } from "../upload-logo/upload-logo.component";
import * as QRCode from "qrcode";
import * as Barcode from "jsbarcode";
import { DomSanitizer } from "@angular/platform-browser";
import { UserService } from "../../../services/user.service";
import { DarkThemeSwitch } from "../../../dark-theme-switch";
import { SettingsDescriptionPopupComponent } from "../../../settings-description-popup/settings-description-popup.component";
import { IdCardProfilePictureComponent } from "../id-card-profile-picture/id-card-profile-picture.component";
import { ConfirmationComponent } from "../../../shared/shared-components/confirmation/confirmation.component";

export const UNANIMATED_CONTAINER: ReplaySubject<boolean> = new ReplaySubject(1);

export interface IDCard {
  profilePicture?: string;
  idNumberData?: {idNumber: number, barcodeURL: string};
  greadLevel?: number;
  backgroundColor?: string;
  logoURL?: string;
  backsideText?: string;
}

export interface BarcodeTypes {
  label: string;
  action: string;
  icon: string;
  textColor: string;
  backgroundColor: string
}

@Component({
  selector: "app-id-card-editor",
  templateUrl: "./id-card-editor.component.html",
  styleUrls: ["./id-card-editor.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class IdCardEditorComponent implements OnInit, OnDestroy {
  backgroundColor: string = '#00b476';
  backsideText: string = '';
  IDNumberData: any = {};
  logoURL: string = '';
  greadLevel: number;

  isLogoAdded: boolean = false;

  
  typeOfBarcodes: BarcodeTypes[] = [
    {
      label: 'Traditional',
      icon: './assets/barcode.svg',
      textColor: '#7f879d',
      backgroundColor: '#F4F4F4',
      action: 'code39'
    },
    {
      label: 'QR Code',
      icon: './assets/qr_code.svg',
      textColor: '#7f879d',
      backgroundColor: '#F4F4F4',
      action: 'qr-code'
    }
  ];
  selectedBarcode: BarcodeTypes = {
    label: 'QR Code',
    icon: './assets/qr_code.svg',
    textColor: '#7f879d',
    backgroundColor: '#F4F4F4',
    action: 'qr-code'
  };
  isUploadedProfilePictures: boolean;
  status: 'disconnect' | 'approved' | 'done' = 'disconnect';
  destroy$ = new Subject();

  constructor(
    public adminService: AdminService,
    private dialog: MatDialog,
    private domSanitizer: DomSanitizer,
    private userService: UserService,
    public darkTheme: DarkThemeSwitch,
    private errorHandler: ErrorHandler,
  ) {}

  ngOnInit(): void {
    merge(of(this.userService.getUserSchool()), this.userService.getCurrentUpdatedSchool$().pipe(filter(s => !!s)))
        .pipe(takeUntil(this.destroy$))
        .subscribe(school => {
          this.isUploadedProfilePictures = school.profile_pictures_completed;
        });
        this.isUploadedProfilePictures ? this.status = 'done' : 'disconnect';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async setUpProfilePicture() {
    const PPD = this.dialog.open(IdCardProfilePictureComponent, {
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
    });
  }

  addBackgroundText() {
    const dialogRef = this.dialog.open(BackgroundTextComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
      data: {text: this.backsideText}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.backsideText = result;
      }
    });
  }

  urlify(text) {
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    //var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url,b,c) {
        var url2 = (c == 'www.') ?  'http://' +url : url;
        return '<a href="' +url2+ '" target="_blank">' + url + '</a>';
    }) 
}

  uploadLogo() {
    const dialogRef = this.dialog.open(UploadLogoComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
      data: {isLogoAdded: this.isLogoAdded}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLogoAdded = true;
        this.logoURL = result;
      }
    });
  }

  editLogoOptions(elem){
    const settings = [
      {
        label: 'Update logo',
        icon: './assets/Refresh (Blue-Gray).svg',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: 'update'
      },
      {
        label: 'Delete logo',
        icon: './assets/Delete (Red).svg',
        textColor: '#E32C66',
        backgroundColor: '#F4F4F4',
        action: 'delete'
      }
    ];

    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: elem.currentTarget, settings}
    });

    st.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false)), filter(r => !!r))
      .subscribe((action) => {
        if (action == 'update') {
          this.uploadLogo();
        }else if (action == 'delete') {
          let data = {
            title : 'Delete logo?',
            message: 'Are you sure you want to delete the logo?',
            okButtonText: 'Delete logo'
          };
          this.openConfirmationDialog(data);
        }
      });

  }

  setUpIDNumber() {
    this.IDNumberData['idNumber'] = Math.floor(100000 + Math.random() * 900000);
    this.selectBarcodeType('qr-code');
  }

  selectBarcodeType(value) {
    if (value == 'qr-code') {
      this.IDNumberData['type'] = 'qr-code';
      var opts = {
        margin: 3,
      }
      QRCode.toDataURL(this.IDNumberData.idNumber.toString(), opts)
        .then((url) => {
          this.IDNumberData['url'] = url;
        })
        .catch((err) => {
          console.error(err);
          this.errorHandler.handleError(err)
        });
    } else {
      this.IDNumberData['type'] = 'code39';
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
      this.IDNumberData['url'] =
        this.domSanitizer.bypassSecurityTrustUrl(dataURL);
    }
  }

  openBarcodeTypePopup(elem) {
    const settings = this.typeOfBarcodes
    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {trigger: elem.currentTarget, settings}
    });

    st.afterClosed().pipe(tap(() => UNANIMATED_CONTAINER.next(false)), filter(r => !!r))
      .subscribe((action) => {
        this.selectedBarcode = this.typeOfBarcodes.find(o => o.action === action);
        this.selectBarcodeType(action);
      });
  }

  setUpGreadLevel(){
    this.greadLevel = 10;
  }

  openConfirmationDialog(data){
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLogoAdded = false;
        this.logoURL = '';
      }
    });
  }
}
