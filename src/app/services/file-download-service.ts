import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as FileSaver from 'file-saver';
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  constructor(private httpClient: HttpClient) { }

  downloadFile(url: string, filename: string): Observable<Blob> {
    return this.httpClient.get(url, {responseType: 'blob'}).pipe(tap(
      (blob) => {
        FileSaver.saveAs(blob, filename);
      }
    ));
  }
}
