import { TimeService } from './app/services/time.service';

export class Util{

    static weekday: string[] = ['Sunday', 'Monday', 'Tuesday',
                      'Wednesday', 'Thursday', 'Friday',
                      'Saturday'];

    static month: string[] = ['Jan', 'Feb', 'Mar',
                        'Apr', 'May', 'June',
                        'July', 'Aug', 'Sept',
                        'Oct', 'Nov', 'Dec'];

    static formatDateTime(s: Date, timeOnly?: boolean, utc?: boolean) {
        let hours = utc ? s.getUTCHours() : s.getHours();
        let formattedTime:string = ((hours > 12) ? hours - 12 : hours === 0 ? 12 : hours) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((hours > 12) ? ' PM' : ' AM');
        if(timeOnly)
          return formattedTime;

        let formattedDate:string = "";
        let now: Date = TimeService.getNowDate();

        if(s.getFullYear() === now.getFullYear()){
          if(s.getMonth() === now.getMonth()){
            if(s.getDate() === now.getDate()){
              formattedDate = "Today"
            } else if(s.getDate() === now.getDate()+1){
              formattedDate = "Tomorrow"
            } else if(s.getDate() === now.getDate()-1){
              formattedDate = "Yesterday"
            } else{
              if(s.getDate() > now.getDate()+6 || s.getDate() < now.getDate()-1){
                formattedDate = this.month[s.getMonth()] +" " +s.getDate();
              } else{
                formattedDate = this.weekday[s.getDay()];
              }
            }
          } else{
            formattedDate = this.month[s.getMonth()] +" " +s.getDate();
          }
        } else{
          return this.month[s.getMonth()] +" " +s.getDate() +", " +s.getFullYear();
        }
        return formattedDate +", " +formattedTime;
    }

    static formatDateTimeForDateRange(sFromDate: Date, sToDate: Date) {
        let formattedTime_sFromDate: string = ((sFromDate.getHours() > 12) ? sFromDate.getHours() - 12 : sFromDate.getHours()) + ':' + ((sFromDate.getMinutes() < 10) ? '0' : '') + sFromDate.getMinutes() + ((sFromDate.getHours() > 12) ? ' PM' : ' AM');
        let formattedTime_sToDate: string = ((sToDate.getHours() > 12) ? sToDate.getHours() - 12 : sToDate.getHours()) + ':' + ((sToDate.getMinutes() < 10) ? '0' : '') + sToDate.getMinutes() + ((sToDate.getHours() > 12) ? ' PM' : ' AM');
        return sFromDate.getMonth()+1 + "/" + sFromDate.getDate() + "," + formattedTime_sFromDate + " to " + (sToDate.getMonth()+1) + "/" + sToDate.getDate() + "," + formattedTime_sToDate
    }
}
