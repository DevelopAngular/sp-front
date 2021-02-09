import {Util} from '../../Util';
import {PassLike} from '../models';
import {HallPass} from '../models/HallPass';
import {Invitation} from '../models/Invitation';
import {Request} from '../models/Request';

export function getFormattedPassDate(pass: PassLike) {
  let date: Date;

  if (pass instanceof Invitation) {
    date = pass.date_choices[0];
  } else if (pass instanceof Request) {
    date = pass.request_time;
    if (!date) {
      date = pass.created;
    }

  } else if (pass instanceof HallPass) {
    date = pass.start_time;
  } else {
    throw Error('Unknown PassLike object: ' + pass);
  }

  if ((pass instanceof Invitation || pass instanceof Request) && Util.invalidDate(date)) {
      return 'Missed Request';
  } else {
      return date ? Util.formatDateTime(date) : '[null date]';
  }
}

export function getInnerPassContent(pass: PassLike, now?: boolean) {
  if (now && !(pass instanceof HallPass)) {
      return 'Request for Now';
  }

  if (!(pass instanceof HallPass)) {
    if (pass.status === 'declined') {
      return 'Declined';
    }
  }
  return getFormattedPassDate(pass);
}

export function getInnerPassName(pass: PassLike) {
  if (!pass.student) {
    return '';
  }
  if (pass.student.first_name === '') {
    return pass.student.display_name;
  }
  return pass.student.first_name.substr(0, 1) + '. ' + pass.student.last_name;
}

export function isBadgeVisible(pass: PassLike) {
  return !(pass instanceof HallPass) && !pass.isRead;
}
