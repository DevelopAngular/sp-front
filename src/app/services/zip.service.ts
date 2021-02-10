import {Injectable} from '@angular/core';
import {forkJoin, from, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

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
             arrayFiles.push(data.files[item].async('blob'));
           }
          }
          return forkJoin({
            names: of(arrayNames),
            files: of(arrayFiles)
          });
        }),
        map(({names, files}) => {
          return names.map((name, i) => {
            return { file_name: name, file: new File([files[i]], name) };
          });
        })
      );
  }
}
