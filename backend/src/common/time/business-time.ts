export const DEFAULT_BUSINESS_TIMEZONE = "Asia/Kolkata";

type CalendarParts = { year: number; month: number; day: number };

type WallClockParts = CalendarParts & { hour: number; minute: number; second: number };

function calendarParts(date: Date, timeZone: string): CalendarParts {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  return { year: values.year, month: values.month, day: values.day };
}

function wallClockParts(date: Date, timeZone: string): WallClockParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  return { year: values.year, month: values.month, day: values.day, hour: values.hour, minute: values.minute, second: values.second };
}

function startForCalendarDate(parts: CalendarParts, timeZone: string): Date {
  const target = Date.UTC(parts.year, parts.month - 1, parts.day);
  let candidate = target;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = wallClockParts(new Date(candidate), timeZone);
    const actualAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    candidate += target - actualAsUtc;
  }
  return new Date(candidate);
}

function addCalendarDays(parts: CalendarParts, days: number): CalendarParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  date.setUTCDate(date.getUTCDate() + days);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function businessDayBoundaries(now = new Date(), timeZone = DEFAULT_BUSINESS_TIMEZONE) {
  const today = calendarParts(now, timeZone);
  const tomorrowParts = addCalendarDays(today, 1);
  const nextWeekParts = addCalendarDays(today, 8);
  return {
    start: startForCalendarDate(today, timeZone),
    tomorrow: startForCalendarDate(tomorrowParts, timeZone),
    nextWeek: startForCalendarDate(nextWeekParts, timeZone),
  };
}

export function startOfBusinessDay(now = new Date(), timeZone = DEFAULT_BUSINESS_TIMEZONE) {
  return businessDayBoundaries(now, timeZone).start;
}
