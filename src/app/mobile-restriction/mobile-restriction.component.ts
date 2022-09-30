import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IDCard } from '../admin/id-cards/id-card-editor/id-card-editor.component';
import { IdcardOverlayContainerComponent } from '../idcard-overlay-container/idcard-overlay-container.component';
import { QRBarcodeGeneratorService } from '../services/qrbarcode-generator.service';
import { IDCardService } from '../services/IDCardService';

declare const window;

@Component({
  selector: 'app-mobile-restriction',
  templateUrl: './mobile-restriction.component.html',
  styleUrls: ['./mobile-restriction.component.scss']
})
export class MobileRestrictionComponent implements OnInit, AfterViewInit, OnDestroy {

  IDCardEnabled: boolean = false;

  IDCARDDETAILS: any;

  constructor(private qrBarcodeGenerator: QRBarcodeGeneratorService,public dialog: MatDialog, private idCardService: IDCardService) {

  }

  ngOnInit(): void {
    // window.Intercom('update', {'hide_default_launcher': true});
    this.idCardService.getIDCardDetails().subscribe({
      next: (result: any) => {
        if (result?.results?.digital_id_card) {
          if (result.results.digital_id_card.enabled) {
            this.IDCardEnabled = true;
          } else {
            return;
          }
          this.IDCARDDETAILS = result.results.digital_id_card;
        }
      },
    });
  }

  ngAfterViewInit(): void {
    window.appLoaded();
  }

  ngOnDestroy(): void {
    setTimeout(function() {
      // window.Intercom('update', {'hide_default_launcher': false});
    }, 500);
  }

  async openIDCard() {
    const  idCardData: IDCard = {
      backgroundColor: this.IDCARDDETAILS.color,
      greadLevel: this.IDCARDDETAILS.show_grade_levels ? '10' : null,
      idNumberData: {
        idNumber: '21158',
        barcodeURL: await this.qrBarcodeGenerator.selectBarcodeType(
          this.IDCARDDETAILS.barcode_type,
          '123456'
        ),
      },
      barcodeType: this.IDCARDDETAILS.barcode_type,
      backsideText: this.IDCARDDETAILS.backside_text,
      logoURL: this.IDCARDDETAILS.signed_url,
      profilePicture: '',
      schoolName: 'Demo School',
      userName: 'Demo User',
      userRole: 'Student',
      showCustomID: this.IDCARDDETAILS.show_custom_ids
    };

    const dialogRef = this.dialog.open(IdcardOverlayContainerComponent, {
      panelClass: 'id-card-overlay-container',
      backdropClass: 'custom-bd',
      data: {idCardData: idCardData, isLoggedIn: true }
    });
  }

}
