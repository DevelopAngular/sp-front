import {SafeHtml} from '@angular/platform-browser';

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
        wrappedData[key] = this.domSanitizer.bypassSecurityTrustHtml(keyArrayLike.map(str =>  typeof str === 'string' ? `<${htmlTag}>${str}</${htmlTag}>` : `<${htmlTag} data-name="${dataObj['Name']}" data-profile="${str.role }">${str.title}</${htmlTag}>`).join(keyArrayLike.length > 1 ? ', ' : ''));
      }
    }
    return wrappedData as {[key: string]: SafeHtml; _data: any};
  } else {
    return this.domSanitizer.bypassSecurityTrustHtml(`<${htmlTag} >Not allowed type</${htmlTag}>`) as SafeHtml;
  }
}

export function prettyDate(date: Date) {
  const time = date.getHours() < 12
    ?
    `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} AM`
    :
    `${date.getHours() - 12}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} PM`;
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${time}`;
}
