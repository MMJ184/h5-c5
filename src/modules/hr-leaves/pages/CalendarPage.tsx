import { Typography } from 'antd';

import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { useLeaveAccess } from '../hooks/useLeaveAccess';

export const CalendarPage = () => {
  const access = useLeaveAccess();

  if (!access.canViewCalendar) {
    return <Typography.Text>You do not have access to the leave calendar.</Typography.Text>;
  }

  return <AvailabilityCalendar />;
};
