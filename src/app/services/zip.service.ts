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
}
