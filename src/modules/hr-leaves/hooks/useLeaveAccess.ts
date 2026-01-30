import { useMemo } from 'react';
import { useAuth } from '../../../auth/useAuth';

export const useLeaveAccess = () => {
  const auth = useAuth();

  return useMemo(() => {
    const hasPermission = (perm: string) => auth.permissions.includes('*') || auth.permissions.includes(perm);
    const hasRole = (role: string) => auth.roles.includes(role);

    return {
      canViewCalendar: hasPermission('leave_calendar_view') || hasRole('hr') || hasRole('manager'),
      canApply: hasPermission('leave_apply') || hasRole('employee'),
      canViewRequests: hasPermission('leave_requests_view') || hasRole('employee'),
      canApproveManager: hasPermission('leave_approvals_manager') || hasRole('manager'),
      canApproveHr: hasPermission('leave_approvals_hr') || hasRole('hr'),
      canManagePolicies: hasPermission('leave_policies_manage') || hasRole('hr'),
    };
  }, [auth.permissions, auth.roles]);
};
