import { Pipe, PipeTransform } from '@angular/core';
import {HallPass} from '../models/HallPass';

@Pipe({
  name: 'except'
})
export class ExceptPipe implements PipeTransform {

  transform(vv: HallPass[], kind: 'deleted non-declinable', contrary?: string): HallPass[] {
    let filterFn = (_: HallPass) => true;
    // TODO:  add more filter kinds
    if (kind === 'deleted non-declinable') {
      filterFn = (exp: HallPass) => {
        const accepted = !(exp.cancellable_by_student===false && exp.cancelled !== null);
        return contrary === 'negate' ? !accepted : accepted;
      }
    }
    const filtered = vv.filter(filterFn);
    return filtered;
  }

}
