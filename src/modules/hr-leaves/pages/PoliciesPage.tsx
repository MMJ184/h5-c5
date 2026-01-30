import { Card, Typography } from 'antd';

import { useLeaveAccess } from '../hooks/useLeaveAccess';

export const PoliciesPage = () => {
  const access = useLeaveAccess();

  if (!access.canManagePolicies) {
    return <Typography.Text>You do not have access to leave policies.</Typography.Text>;
  }

  return (
    <Card title="Leave Policies">
      <Typography.Paragraph type="secondary">
        Policy management is optional. Hook this section into your HR policy editor or leave type manager.
      </Typography.Paragraph>
    </Card>
  );
};
