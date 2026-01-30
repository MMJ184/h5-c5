import { Typography } from 'antd';

import { BroadcastForm } from '../components/BroadcastForm';
import { useAuth } from '../../../auth/useAuth';

export const BroadcastPage = () => {
  const auth = useAuth();

  const hasAccess =
    auth.permissions.includes('*') ||
    auth.permissions.includes('hr_broadcast_manage') ||
    auth.roles.includes('hr');

  if (!hasAccess) {
    return <Typography.Text>You do not have access to broadcast messages.</Typography.Text>;
  }

  return <BroadcastForm />;
};
