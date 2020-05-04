import { Injectable } from '@angular/core';
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
}
