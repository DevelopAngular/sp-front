export class Duration {
  constructor(public display: string,
              public value: number) {
  }

  static fromJSON(JSON: any): Duration {
    const display: string = JSON / 60 + ' minutes',
      value: number = JSON;
    return new Duration(display, value);
  }
}
