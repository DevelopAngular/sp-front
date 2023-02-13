import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinance'
})
export class OrdinancePipe implements PipeTransform {

  // Given the position in a line, return the ordinal number
  // Position 1: 1st, Position 3: 3rd, etc.
  transform(value: number): string {
    const suffixMap = {
      1: 'st',
      2: 'nd',
      3: 'rd',
    };
    const edgeCases = [11, 12, 13];

    const lastTwoDigits = value % 100;

    if (edgeCases.includes(lastTwoDigits)) {
      return `${value}th`;
    }

    const lastDigit = value % 10;
    const suffix = suffixMap[lastDigit];

    return !suffix ? `${value}th` : `${value}${suffix}`;
  }
}
