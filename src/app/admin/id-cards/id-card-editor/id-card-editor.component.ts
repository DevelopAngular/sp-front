import { Component, ErrorHandler, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { merge, of, ReplaySubject, Subject } from "rxjs";
import { catchError, filter, map, takeUntil, tap } from "rxjs/operators";
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
import { IDCardService } from "../../../services/IDCardService";
// import * as PassFunctions from '../../../support/fun';

export const UNANIMATED_CONTAINER: ReplaySubject<boolean> = new ReplaySubject(1);

export interface IDCard {
  userName?: string;
  schoolName?: string;
  userRole?: string;
  profilePicture?: string;
  idNumberData?: {idNumber: number, barcodeURL: any};
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
  profile_picture: string = '';
  IDNumberData: any = {};
  logoURL: string = '';
  greadLevel: number;

  isLogoAdded: boolean = false;

  
  typeOfBarcodes: BarcodeTypes[] = [
    {
      label: 'Traditional',
      icon: './assets/Barcode (Black).svg',
      textColor: '#7f879d',
      backgroundColor: '#F4F4F4',
      action: 'code39'
    },
    {
      label: 'QR Code',
      icon: './assets/QR Code (Black).svg',
      textColor: '#7f879d',
      backgroundColor: '#F4F4F4',
      action: 'qr-code'
    }
  ];
  selectedBarcode: BarcodeTypes = {
    label: 'QR Code',
    icon: './assets/QR Code (Black).svg',
    textColor: '#7f879d',
    backgroundColor: '#F4F4F4',
    action: 'qr-code'
  };

  IDCardVisibleTo: string = 'Students only';
  IDCardEnabled: boolean = false;
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
    public idCardService: IDCardService
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
    // const PPD = this.dialog.open(IdCardProfilePictureComponent, {
    //   panelClass: 'accounts-profiles-dialog',
    //   backdropClass: 'custom-bd',
    //   width: '425px',
    //   height: '500px',
    // });
    this.profile_picture = "assets/Dummy_Profile.png";
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
          this.openConfirmationDialog(data).then((res) => {
            if (res) {
              this.isLogoAdded = false;
              this.logoURL = '';
            }
          });
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
          this.IDNumberData['barcodeURL'] = url;
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
      this.IDNumberData['barcodeURL'] =
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
    return new Promise(resolve => {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe((result) => {
      return resolve(result);
    });
  });
  }

  openVisibleToPopup(elem) {
    const settings = [
      {
        label: 'Students only',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: 'students'
      },
      {
        label: 'Staff only',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: 'staff'
      },
      {
        label: 'Students and Staff',
        textColor: '#7f879d',
        backgroundColor: '#F4F4F4',
        action: 'students_staff'
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
        this.IDCardVisibleTo = settings.find(o => o.action === action).label;
      });
  }

  enableIDCard(){
    if (this.IDCardEnabled) {
      let data = {
        title : 'Disable ID Cards?',
        message: 'Are you sure you want to disable ID cards?',
        okButtonText: 'Disable',
        okButtonBackgroundColor: '#7083A0'
      };
      this.openConfirmationDialog(data).then((res) => {
        if (res) {
          this.idCardService.disableIDCard().subscribe(result => {
            console.log("Result : ", result)
            this.IDCardEnabled = false
          })
          
        }
      });
    }else {


      this.idCardService.enableIDCard().subscribe({
        next: result => {
          console.log("Result : ", result)
          this.IDCardEnabled = true
        },
        error: error => {
          console.log("Result : ", error)
        }
      })

      


      // this.idCardService.getIDCardDetails().subscribe(result => {
      //   console.log("result : ", result)
      // });
    }
  }
}
