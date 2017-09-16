import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
/**
 * Created by guillaume on 02/09/2017.
 */
export class Utils {

  public static months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  public static days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  public static EMAIL_REGEX = '[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?'

  /*Dates*/

  /* Return a string displaying date from a string date */
  static dateToString(date: string): string {
    let ngbDate = this.stringToNgbDate(date);
    return this.ngbDateToString(ngbDate);
  }

  static dateToStringShort(date: string): string {
    let ngbDate = this.stringToNgbDate(date);
    return this.ngbDateToStringShort(ngbDate);
  }

  /* Return a string from a ngbDateStruct */
  static ngbDateToString(date: NgbDateStruct): string {
    let newDate = new Date(date.year, date.month - 1, date.day);
    return this.printDate(newDate);
  }

  static ngbDateToStringShort(date: NgbDateStruct): string {
    let newDate = new Date(date.year, date.month - 1, date.day);
    return this.printDateShort(newDate);
  }


  static printDate(date: Date) {
    return this.days[date.getDay()] + ' ' + date.getDate() + ' ' + this.months[date.getMonth()];
  }

  static printDateShort(date: Date) {
    return date.getDate() + ' ' + this.months[date.getMonth()];
  }

  /* Return a NgbDateStruct from a string date */
  static stringToNgbDate(date: string): NgbDateStruct {
    let d = new Date(date);
    return {day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear()};
  }

  /* Return a string displaying time from date string*/
  static timeToString(date: string): string {
    return this.getHours(date) + 'h' + this.getMinutes(date);
  }

  /* Return a string displaying time from integer*/
  static timeIntToString(hour: number): string {
    if (hour === Math.round(hour))
      return hour + 'h00'
    else
      return Math.round(hour) - 1 + 'h30'
  }

  static getDate(date: string): string {
    return (new Date(date)).getDate() + ' ' + this.months[(new Date(date)).getMonth()];
  }

  static getHours(date: string): number {
    return (new Date(date)).getHours();
  }

  static getMinutes(date: string): string {
    let m = (new Date(date)).getMinutes();
    if (m === 0)
      return '00';
    if (m < 10)
      return '0' + m;
    return m.toString();
  }

}
