export interface CalendarCell {
  key: string;
  day: number | null;
  isSunday: boolean;
  isToday: boolean;
  isClicked: boolean;
  fullDate: Date | null;
}