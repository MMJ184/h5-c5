import dayjs from 'dayjs';

export const dateKey = (d: string | dayjs.Dayjs) => dayjs(d).format('YYYY-MM-DD');
