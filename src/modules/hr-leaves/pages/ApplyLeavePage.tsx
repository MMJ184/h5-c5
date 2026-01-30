import { ApplyLeaveForm } from '../components/ApplyLeaveForm';
import { useLeaveAccess } from '../hooks/useLeaveAccess';
import { Typography } from 'antd';

export const ApplyLeavePage = () => {
  const access = useLeaveAccess();

  if (!access.canApply) {
    return <Typography.Text>You do not have access to apply for leave.</Typography.Text>;
  }

  return <ApplyLeaveForm />;
};
