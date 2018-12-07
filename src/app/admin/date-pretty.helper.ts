import {Injectable} from '@angular/core';

@Injectable()

export class DatePrettyHelper {
  static transform(date: Date) {

    const time = date.getHours() < 12
                          ?
                `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} AM`
                          :
                `${date.getHours() - 12}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()} PM`;

    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${time}`;
  }
}
