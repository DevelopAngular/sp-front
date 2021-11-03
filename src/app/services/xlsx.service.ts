import {Injectable} from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class XlsxService {

  constructor() { }

  parseXlSXFile(file: ProgressEvent | any) {
    const raw = XLSX.read(file.target.result, {type: 'binary'});
    const sn = raw.SheetNames[0];
    const stringCollection = raw.Sheets[sn];
    const data = XLSX.utils.sheet_to_json(stringCollection, {header: 1, blankrows: false});
    return data.slice(1);
  }

  generate(jsonObj, fileName: string = 'TestCSV') {
    const WorkBook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(jsonObj);
    XLSX.utils.book_append_sheet(WorkBook, sheet);
    // sheet['!cols'] = [{wpx: 170}, {wpx: 120}, {wpx: 120}, {wpx: 120}, {wpx: 120}, {wpx: 120}];
    XLSX.writeFile(WorkBook, `${fileName}.csv`, {bookType: 'csv'});
  }
}
