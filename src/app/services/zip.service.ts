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
          for (let item in data.files) {
            const extension = item.split('.')[item.toLowerCase().split('.').length - 1].toLowerCase();
           if (item[0] !== '_' && (extension === 'jpeg' || extension === 'png' || extension === 'jpg')) {
             arrayFiles.push(data.files[item].async('blob'));
             if (item.includes('/')) {
               const pathArray = item.split('/');
               item = pathArray[pathArray.length - 1];
             }
             arrayNames.push(item);
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
            return { file_name: name.toLowerCase().trim(), file: newFile };
          });
        })
      );
  }
}
