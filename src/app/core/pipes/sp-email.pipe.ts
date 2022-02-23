import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'spEmail'
})
export class SpEmailPipe implements PipeTransform {

  transform(email: string, ...args: unknown[]): unknown {
    if (email.includes('@spnx.local')) {
      email = email.replace('@spnx.local', '');
    }
    return email.toLowerCase();
  }

}
