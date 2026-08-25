export const dateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (days: number, from = new Date()) => {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return dateKey(date);
};

export const humanDate = (value: string | null) => {
  if (!value) return "No date";
  const date = new Date(`${value}T12:00:00`);
  const today = dateKey();
  if (value === today) return "Today";
  if (value === addDays(1)) return "Tomorrow";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date);
};

export const fullToday = () => new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());

export const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

export const isWithinNextDays = (value: string | null, days: number) => !!value && value >= dateKey() && value <= addDays(days);
