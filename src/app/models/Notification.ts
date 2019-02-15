export class NotificationData {

  constructor(public destination: string,
              public gcm_notification_sound: string,
              public hallpass_id: string,
              public pass_duration: string,
              public school_id: string,
              public start_time: string,
              public student: string) {
  }

  static fromJSON(JSON: any): NotificationData {
    if (!JSON) {
      return null;
    }

    const destination: string = '' + JSON['destination'],
      gcm_notification_sound: string = '' + JSON['gcm.notification.sound'],
      hallpass_id: string = '' + JSON['hallpass_id'],
      pass_duration: string = '' + JSON['pass_duration'],
      school_id: string = '' + JSON['school_id'],
      start_time: string = '' + JSON['start_time'],
      student: string = '' + JSON['student'];

    return new NotificationData(destination, gcm_notification_sound, hallpass_id, pass_duration, school_id, start_time, student);
  }
}

export class NotificationDisplay {

  constructor(public body: string,
              public title: string) {
  }

  static fromJSON(JSON: any): NotificationDisplay {
    if (!JSON) {
      return null;
    }

    const body: string = '' + JSON['body'],
      title: string = '' + JSON['title'];

    return new NotificationDisplay(body, title);
  }
}

export class Notification {
  constructor(public collapse_key: string,
              public data: NotificationData,
              public from: string,
              public notification: NotificationDisplay) {

  }

  static fromJSON(JSON: any): Notification {
    if (!JSON) {
      return null;
    }

    const collapse_key: string = '' + JSON['collapse_key'],
      data: NotificationData = NotificationData.fromJSON(JSON['data']),
      from: string = '' + JSON['from'],
      notification: NotificationDisplay = NotificationDisplay.fromJSON(JSON['notification']);

    return new Notification(collapse_key, data, from, notification);
  }
}
