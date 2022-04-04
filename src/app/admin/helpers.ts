import {SafeHtml} from '@angular/platform-browser';
import * as moment from 'moment';

export function wrapToHtml(

  dataObj: {[key: string]: string | string[]} | string,
  htmlTag: 'span' | 'div',


  ): {[key: string]: SafeHtml; _data: any} | SafeHtml {
  if (typeof dataObj === 'string') {
    return this.domSanitizer.bypassSecurityTrustHtml(`<${htmlTag} >${dataObj}</${htmlTag}>`) as SafeHtml;
  } else if (typeof dataObj === 'object' && !Array.isArray(dataObj)) {
    const wrappedData = {};
    for (const key in dataObj) {
      // debugger
      if (typeof dataObj[key] === 'string') {
        const keyStringLike = <string>(dataObj[key]);
        wrappedData[key] = this.domSanitizer.bypassSecurityTrustHtml(`<${htmlTag}>${keyStringLike}</${htmlTag}>`);
      }
      if (Array.isArray(dataObj[key])) {
        const keyArrayLike = <Array<any>>(dataObj[key]);
        // console.log(keyArrayLike);
        wrappedData[key] = this.domSanitizer.bypassSecurityTrustHtml(keyArrayLike.map(item =>  typeof item === 'string' ? `<${htmlTag}>${item}</${htmlTag}>` : `<${htmlTag} style="text-decoration: underline;" data-name="${dataObj['Name']}" data-profile="${item.role }">${item.title}</${htmlTag}>`).join(keyArrayLike.length > 1 ? ', ' : ''));
      }
    }
    return wrappedData as {[key: string]: SafeHtml; _data: any};
  } else {
    return this.domSanitizer.bypassSecurityTrustHtml(`<${htmlTag} >Not allowed type</${htmlTag}>`) as SafeHtml;
  }
}

export function prettyDate(date: Date) {
  return moment(date).format('MM/DD/YYYY') + ' at ' + moment(date).format('hh:mm A');
}
