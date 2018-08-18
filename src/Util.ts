export class Util{

    static weekday: string[] = ['Sunday', 'Monday', 'Tuesday',
                      'Wednesday', 'Thursday', 'Friday',
                      'Saturday'];
  
    static month: string[] = ['Jan.', 'Feb.', 'Mar.',
                        'Apr.', 'May', 'June',
                        'July', 'Aug.', 'Sept.',
                        'Oct.', 'Nov.', 'Dec.'];

    static formatDateTime(s: Date, timeOnly?: boolean){
        let formattedTime:string = ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? ' PM' : ' AM');
        if(timeOnly)
          return formattedTime;
          
        let formattedDate:string = "";
        let now: Date = new Date();
    
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
}