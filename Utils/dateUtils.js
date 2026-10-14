export function getDateWithOffset(offsetDays) {
  const date = new Date();

  date.setDate(date.getDate() + offsetDays);

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear()
  };
}