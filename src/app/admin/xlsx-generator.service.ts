import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class XlsxGeneratorService {

  constructor(
  ) {}

  generate(jsonObj) {
    const WorkBook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(jsonObj);
          XLSX.utils.book_append_sheet(WorkBook, sheet);
    // sheet['!cols'] = [{wpx: 170}, {wpx: 120}, {wpx: 120}, {wpx: 120}, {wpx: 120}, {wpx: 120}];
          XLSX.writeFile(WorkBook, 'TestCSV.csv', {bookType: 'csv'});
  }

}
