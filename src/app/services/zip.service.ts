import { Injectable } from '@angular/core';
import { forkJoin, from, of, zip } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

declare const JSZip;

@Injectable({
  providedIn: 'root'
})
export class ZipService {

  constructor() {}

  loadZip(file) {
    return from(JSZip.loadAsync(file, {createFolders: false}))
      .pipe(
        switchMap((data: any) => {
          const arrayFiles = [];
          const arrayNames = [];
          for (const item in data.files) {
            const extension = item.split('.')[item.toLowerCase().split('.').length - 1];
           if (item[0] !== '_' && (extension === 'jpeg' || extension === 'png')) {
             arrayNames.push(item);
             arrayFiles.push(from(data.files[item].async('base64')));
           }
          }
          return forkJoin({
            names: of(arrayNames),
            files: zip(...arrayFiles)
          });
        }),
        map(({names, files}) => {
          return names.map((name, i) => {
            return { file_name: name, file: files[i] };
          });
        })
      );
  }

  // getEntries(file): Observable<Array<ZipEntry>> {
  //   return new Observable(subscriber => {
  //     const reader = new zip.BlobReader(file);
  //     zip.createReader(reader, zipReader => {
  //       zipReader.getEntries(entries => {
  //         subscriber.next(entries);
  //         subscriber.complete();
  //       });
  //     }, message => {
  //       subscriber.error({ message });
  //     });
  //   });
  // }
  //
  // getData(entry: ZipEntry): ZipTask {
  //   const progress = new Subject<ZipTaskProgress>();
  //   const data = new Observable<Blob>(subscriber => {
  //     const writer = new zip.BlobWriter();
  //
  //     // Using `as any` because we don't want to expose this
  //     // method in the interface
  //     (entry as any).getData(writer, blob => {
  //       subscriber.next(blob);
  //       subscriber.complete();
  //       progress.next(null);
  //     }, (current, total) => {
  //       progress.next({ active: true, current, total });
  //     });
  //   });
  //   return { progress, data };
  // }
}
