import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { merge, of, ReplaySubject, Subject } from "rxjs";
import { filter, takeUntil, tap } from "rxjs/operators";
import { AdminService } from "../../../services/admin.service";
import { BackgroundTextComponent } from "../background-text/background-text.component";
import { UploadLogoComponent } from "../upload-logo/upload-logo.component";
import { UserService } from "../../../services/user.service";
import { DarkThemeSwitch } from "../../../dark-theme-switch";
import { SettingsDescriptionPopupComponent } from "../../../settings-description-popup/settings-description-popup.component";
import { IdCardProfilePictureComponent } from "../id-card-profile-picture/id-card-profile-picture.component";
import { ConfirmationComponent } from "../../../shared/shared-components/confirmation/confirmation.component";
import { BARCODE_TYPES, BarcodeTypes, IDCardService } from '../../../services/IDCardService'
import { QRBarcodeGeneratorService } from "../../../services/qrbarcode-generator.service";
import { ToastService } from "../../../services/toast.service";
import * as moment from "moment";
import { IdCardGradeLevelsComponent } from "../id-card-grade-levels/id-card-grade-levels.component";
import { IdCardIdNumbersComponent } from "../id-card-id-numbers/id-card-id-numbers.component";

export const UNANIMATED_CONTAINER: ReplaySubject<boolean> = new ReplaySubject(
  1
);

@Component({
  selector: "app-id-card-editor",
  templateUrl: "./id-card-editor.component.html",
  styleUrls: ["./id-card-editor.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class IdCardEditorComponent implements OnInit, OnDestroy {
  idCardFormData: FormData = new FormData();

  IDCARDDETAILS: any = {}

  backgroundColor: string = "#00b476";
  backsideText: string = "";
  profile_picture: string = "";
  IDNumberData: any = {};
  logoURL: string = "";
  greadLevel: string;

  isInEditingMode: boolean = false;

  isLogoAdded: boolean = false;

  typeOfBarcodes: BarcodeTypes[] = BARCODE_TYPES;
  selectedBarcode: BarcodeTypes;

  IDCardVisibleTo: string = "Students only";
  IDCardEnabled: boolean = false;
  isUploadedProfilePictures: boolean;
  status: "disconnect" | "approved" | "done" = "disconnect";
  destroy$ = new Subject();
  isAdded: boolean = false;
  showCustomID: boolean = false;
  isScrollable: boolean;

  constructor(
    public adminService: AdminService,
    private dialog: MatDialog,
    private userService: UserService,
    public darkTheme: DarkThemeSwitch,
    public idCardService: IDCardService,
    private qrBarcodeGenerator: QRBarcodeGeneratorService,
    private toast: ToastService
  ) {}

  @HostListener('document.scroll', ['$event'])
  scroll(event) {
    this.isScrollable = event.currentTarget.scrollTop > 20;
  }

  ngOnInit(): void {
    this.fetchAndSetIdCard()
    merge(
      of(this.userService.getUserSchool()),
      this.userService.getCurrentUpdatedSchool$().pipe(filter((s) => !!s))
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe((school) => {
        this.isUploadedProfilePictures = school.profile_pictures_completed;
        if (this.isUploadedProfilePictures) {
          this.profile_picture = "assets/Dummy_Profile.png";
        }
      });
    this.isUploadedProfilePictures ? (this.status = "done") : "disconnect";
  }

  private fetchAndSetIdCard() {
    this.idCardService.getIDCardDetailsEdit().subscribe({
      next: (result) => {
        if (result?.results?.digital_id_card) {
          this.isAdded = true;
          const IDCARDDETAILS = result.results.digital_id_card;
          this.IDCARDDETAILS = IDCARDDETAILS;
          this.setUpData(IDCARDDETAILS);
        }
      },
      error: (error: any) => {
        console.log("Error : ", error)
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setUpData(IDCARDDETAILS) {
    this.IDCardEnabled = IDCARDDETAILS.enabled;
    this.backsideText = IDCARDDETAILS.backside_text;
    this.backgroundColor = IDCARDDETAILS.color;
    this.IDCardVisibleTo = IDCARDDETAILS.visible_to_who;
    if (IDCARDDETAILS.show_custom_ids) {
      this.selectBarcodeType(IDCARDDETAILS.barcode_type || 'qr-code', false)
    }
    if (IDCARDDETAILS.show_grade_levels) {
      this.greadLevel = '11';
    }
    if (IDCARDDETAILS.signed_url && IDCARDDETAILS.logo_file_name) {
      this.logoURL = IDCARDDETAILS.signed_url;
    }

  }

  setBackgroundColor() {
    this.idCardFormData.delete("color");
    this.idCardFormData.append("color", this.backgroundColor);
    this.autoSave();
  }

  saveIDCardFields() {
    this.idCardService.updateIDCardField(this.idCardFormData).subscribe({
      next: () => {
        this.toast.openToast({ title: "ID Cards updated", type: "success" });
        this.isInEditingMode = false;
      },
    });
  }

  autoSave() {
    if (this.IDCardEnabled) {
      this.isInEditingMode = true;
      return;
    } else if (this.isAdded) {
      this.isInEditingMode = false;
      this.idCardService.updateIDCardField(this.idCardFormData).subscribe({
        next: () => {
          this.idCardFormData = new FormData();
        },
      });
    }
  }

  cancelEditing() {
    this.idCardFormData = new FormData();
    this.isInEditingMode = false;
    this.fetchAndSetIdCard();
  }

  async setUpProfilePicture() {
    this.dialog.open(IdCardProfilePictureComponent, {
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '510px',
    });
    this.profile_picture = "assets/Dummy_Profile.png";
    // this.isInEditingMode = true;
  }

  addBackgroundText() {
    const dialogRef = this.dialog.open(BackgroundTextComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
      data: { text: this.backsideText },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.backsideText = result;
        this.idCardFormData.delete("backside_text");
        this.idCardFormData.append("backside_text", this.backsideText);
        this.autoSave();
      }
    });
  }

  urlify(text) {
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    //var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url, b, c) {
      var url2 = c == "www." ? "http://" + url : url;
      return '<a href="' + url2 + '" target="_blank">' + url + "</a>";
    });
  }

  uploadLogo() {
    const dialogRef = this.dialog.open(UploadLogoComponent, {
      panelClass: "search-pass-card-dialog-container",
      backdropClass: "custom-bd",
      data: { isLogoAdded: this.isLogoAdded },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLogoAdded = true;
        this.logoURL = result.logo_url;
        this.idCardFormData.delete("logo_file_name");
        this.idCardFormData.delete("logo_file");
        this.idCardFormData.append("logo_file_name", result.file_name);
        this.idCardFormData.append("logo_file", result.logo_file);
        this.autoSave();
      }
    });
  }

  editLogoOptions(elem) {
    const settings = [
      {
        label: "Update logo",
        icon: "./assets/Refresh (Blue-Gray).svg",
        textColor: "#7f879d",
        backgroundColor: "#F4F4F4",
        action: "update",
      },
      {
        label: "Delete logo",
        icon: "./assets/Delete (Red).svg",
        textColor: "#E32C66",
        backgroundColor: "#F4F4F4",
        action: "delete",
      },
    ];

    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: "consent-dialog-container",
      backdropClass: "invis-backdrop",
      data: { trigger: elem.currentTarget, settings },
    });

    st.afterClosed()
      .pipe(
        tap(() => UNANIMATED_CONTAINER.next(false)),
        filter((r) => !!r)
      )
      .subscribe((action) => {
        if (action == "update") {
          this.uploadLogo();
        } else if (action == "delete") {
          let data = {
            title: "Delete logo?",
            message: "Are you sure you want to delete the logo?",
            okButtonText: "Delete logo",
          };
          this.openConfirmationDialog(data).then((res) => {
            if (res) {
              this.isLogoAdded = false;
              this.logoURL = "";
              this.idCardFormData.append("logo_file_name", "");
              this.autoSave();
            }
          });
        }
      });
  }

  setUpIDNumber(type: string = "qr-code", byUser: boolean = false) {
    if (byUser) {
      this.idCardFormData.delete("show_custom_ids");
      this.idCardFormData.append("show_custom_ids", 'true');
      const PPD = this.dialog.open(IdCardIdNumbersComponent, {
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd',
        width: '425px',
        height: '510px',
      });

      PPD.afterClosed().subscribe(() => {
        this.userService.getStatusOfIDNumber().subscribe({
          next: (result: any) => {
            if (result?.results?.setup) {
              let generateQR: boolean = false;
              if (!this.IDNumberData?.idNumber) {
                generateQR = true;
              }
              this.IDNumberData["idNumber"] = '123456';
              this.showCustomID = true;
              if (generateQR) {
                this.selectBarcodeType(type, byUser);
              }
              this.selectedBarcode = this.typeOfBarcodes.find(
                (o) => o.action === type
              );
            }
          }
        })
      });
    }
  }

  async selectBarcodeType(value, byUser: boolean = false) {
    this.IDNumberData["idNumber"] = '123456';
    this.showCustomID = true;
    this.IDNumberData["barcodeURL"] =
      await this.qrBarcodeGenerator.selectBarcodeType(value, 123456);
    if (value == "qr-code") {
      this.IDNumberData["type"] = "qr-code";
      this.selectedBarcode = BARCODE_TYPES[1]
    } else {
      this.IDNumberData["type"] = "code39";
      this.selectedBarcode = BARCODE_TYPES[0];
    }
    if (byUser) {
      this.idCardFormData.delete("barcode_type");
      this.idCardFormData.append("barcode_type", this.IDNumberData.type);
      this.autoSave();
    }
  }

  openBarcodeTypePopup(elem) {
    const settings = this.typeOfBarcodes;
    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: "consent-dialog-container",
      backdropClass: "invis-backdrop",
      data: { trigger: elem.currentTarget, settings },
    });

    st.afterClosed()
      .pipe(
        tap(() => UNANIMATED_CONTAINER.next(false)),
        filter((r) => !!r)
      )
      .subscribe((action) => {
        this.selectedBarcode = this.typeOfBarcodes.find(
          (o) => o.action === action
        );
        this.selectBarcodeType(action, true);
      });
  }

  setUpGreadLevel() {
    const PPD = this.dialog.open(IdCardGradeLevelsComponent, {
      panelClass: 'accounts-profiles-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '510px',
    });

    PPD.afterClosed().subscribe(() => {
      this.userService.getStatusOfGradeLevel().subscribe({
        next: (result: any) => {
          if (result?.results?.setup) {
            this.greadLevel = '11';
            if (!this.IDCARDDETAILS.show_grade_levels) {
              this.idCardFormData.delete("show_grade_levels");
              this.idCardFormData.append("show_grade_levels", 'true');
              this.autoSave();
            }
          }
        }
      });
    });
  }

  openConfirmationDialog(data) {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        panelClass: "search-pass-card-dialog-container",
        backdropClass: "custom-bd",
        disableClose: true,
        data: data,
      });

      dialogRef.afterClosed().subscribe((result) => {
        return resolve(result);
      });
    });
  }

  openVisibleToPopup(elem) {
    const settings = [
      {
        label: "Students only",
        textColor: "#7f879d",
        backgroundColor: "#F4F4F4",
        action: "students",
      },
      {
        label: "Staff only",
        textColor: "#7f879d",
        backgroundColor: "#F4F4F4",
        action: "staff",
      },
      {
        label: "Students and Staff",
        textColor: "#7f879d",
        backgroundColor: "#F4F4F4",
        action: "students_staff",
      },
    ];
    UNANIMATED_CONTAINER.next(true);
    const st = this.dialog.open(SettingsDescriptionPopupComponent, {
      panelClass: "consent-dialog-container",
      backdropClass: "invis-backdrop",
      data: { trigger: elem.currentTarget, settings },
    });

    st.afterClosed()
      .pipe(
        tap(() => UNANIMATED_CONTAINER.next(false)),
        filter((r) => !!r)
      )
      .subscribe((action) => {
        this.IDCardVisibleTo = settings.find((o) => o.action === action).label;
        this.idCardFormData.delete("visible_to_who");
        this.idCardFormData.append("visible_to_who", this.IDCardVisibleTo);
        this.autoSave();
      });
  }

  enableIDCard() {
    if (this.IDCardEnabled) {
      let data = {
        title: "Disable ID Cards?",
        message: "Are you sure you want to disable ID cards?",
        okButtonText: "Disable",
        okButtonBackgroundColor: "#7083A0",
      };
      this.openConfirmationDialog(data).then((res) => {
        if (res) {
          this.idCardService.disableIDCard().subscribe(() => {
            this.toast.openToast({ title: "ID Cards disabled", type: "info" });
            this.IDCardEnabled = false;
          });
        }
      });
    } else if (!this.isAdded) {
      let body: FormData = new FormData();
      body.append('visible_to_who', 'Staff only');
      body.append('datetime_created', moment().toISOString());
      body.append('enabled', 'true');
      this.idCardService.addIDCard(body).subscribe({
        next: () => {
          this.IDCardEnabled = true;
          this.toast.openToast({ title: "ID Cards are live", type: "success" });
          this.idCardService.enableIDCard().subscribe({
            next: () => {
              this.isAdded = true;
              this.IDCardEnabled = true;
            },
            error: (error) => {
              console.log("Result : ", error);
            },
          });
        }
      })
    } else if (!this.IDCardEnabled) {
      this.idCardService.enableIDCard().subscribe({
        next: () => {
          this.isAdded = true;
          this.IDCardEnabled = true;
          this.toast.openToast({ title: "ID Cards are live", type: "success" });
        },
        error: (error) => {
          console.log("Result : ", error);
        },
      });

    }
  }
}
