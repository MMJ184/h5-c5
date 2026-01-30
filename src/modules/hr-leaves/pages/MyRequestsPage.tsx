import { Typography } from 'antd';

import { LeaveRequestsTable } from '../components/LeaveRequestsTable';
import { useLeaveAccess } from '../hooks/useLeaveAccess';
import { useLeaveCurrentUser } from '../hooks/useLeaveData';

export const MyRequestsPage = () => {
  const access = useLeaveAccess();
  const { data: currentUser } = useLeaveCurrentUser();

  if (!access.canViewRequests) {
    return <Typography.Text>You do not have access to view leave requests.</Typography.Text>;
  }

  if (!currentUser) return null;

  return <LeaveRequestsTable userId={currentUser.id} />;
};
