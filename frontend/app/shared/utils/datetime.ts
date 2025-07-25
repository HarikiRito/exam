import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with UTC plugin
dayjs.extend(utc);

export function convertLocalDateTimeToUTC(date: Date): Dayjs {
  return dayjs(date).utc();
}
