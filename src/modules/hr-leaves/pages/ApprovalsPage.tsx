import { Card, Space, Tabs, Typography } from 'antd';

import { ApprovalsQueueTable } from '../components/ApprovalsQueueTable';
import { useLeaveAccess } from '../hooks/useLeaveAccess';
import { useLeaveCurrentUser } from '../hooks/useLeaveData';

export const ApprovalsPage = () => {
  const access = useLeaveAccess();
  const { data: currentUser } = useLeaveCurrentUser();

  if (!access.canApproveManager && !access.canApproveHr) {
    return <Typography.Text>You do not have access to approvals.</Typography.Text>;
  }

  if (!currentUser) return null;

  if (access.canApproveManager && access.canApproveHr) {
    return (
      <Card>
        <Tabs
          items={[
            {
              key: 'manager',
              label: 'Manager Queue',
              children: <ApprovalsQueueTable role="MANAGER" actorId={currentUser.id} />, 
            },
            {
              key: 'hr',
              label: 'HR Queue',
              children: <ApprovalsQueueTable role="HR" actorId={currentUser.id} />, 
            },
          ]}
        />
      </Card>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {access.canApproveManager && <ApprovalsQueueTable role="MANAGER" actorId={currentUser.id} />}
      {access.canApproveHr && <ApprovalsQueueTable role="HR" actorId={currentUser.id} />}
    </Space>
  );
};
