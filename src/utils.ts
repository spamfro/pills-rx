export type Shape<T> = T & { [key: string]: any };

export class Dates {
  static addDays(dt: Date, n: number): Date {
    return new Date(dt.getTime() + n * 24 * 60 * 60 * 1000);
  }
  static *range(bdt: Date, edt?: Date): Generator<Date> {
    for (let dt = bdt; edt === undefined || dt < edt; dt = Dates.addDays(dt, 1)) {
      yield dt;
    }
  }
}

export class Format {
  static day(dt: Date): string {
    return dt === undefined ? '' : `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }
  static weekDay(dt: Date): string {
    return dt === undefined ? '' : `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${Format.weekday[dt.getDay()]}`;
  }
  static weekday = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
}
