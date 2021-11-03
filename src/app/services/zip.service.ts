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
           if (item[0] !== '_' && (extension === 'jpeg' || extension === 'png' || extension === 'jpg')) {
             arrayNames.push(item);
             arrayFiles.push(data.files[item].async('blob'));
           }
          }
          return forkJoin({
            names: of(arrayNames),
            files: from(Promise.all(arrayFiles))
          });
        }),
        map(({names, files}) => {
          return names.map((name, i) => {
            const newFile = new File([files[i]], name, {type: 'image/jpeg'});
            return { file_name: name, file: newFile };
          });
        })
      );
  }
}
