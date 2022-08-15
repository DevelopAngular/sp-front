import { ErrorHandler, Injectable } from '@angular/core';
import * as QRCode from "qrcode";
import * as Barcode from "jsbarcode";
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class QRBarcodeGeneratorService {

  constructor(
    private errorHandler: ErrorHandler,
    private domSanitizer: DomSanitizer,
  ) { }

  async selectBarcodeType(value, data) {
    if (value == 'qr-code') {
      var opts = {
        margin: 3,
      }
      let finalURL: string =  QRCode.toDataURL(data.toString(), opts)
        .then((url) => {
          return url;
        })
        .catch((err) => {
          console.error(err);
          this.errorHandler.handleError(err)
        });
        return finalURL
    } else {
      const svgNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      const xmlSerializer = new XMLSerializer();
      Barcode(svgNode, data.toString(), {
        format: "CODE39",
        width: 1,
        height: 50,
        displayValue: false,
      });
      const svgText = xmlSerializer.serializeToString(svgNode);
      var dataURL = "data:image/svg+xml," + encodeURIComponent(svgText);
      return this.domSanitizer.bypassSecurityTrustUrl(dataURL);
    }
  }
}
