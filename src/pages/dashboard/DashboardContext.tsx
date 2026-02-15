import React, { createContext, useContext } from 'react';

export type DashboardTimeRangeKey = '7d' | '30d' | '90d' | 'ytd';

export interface DashboardTimeRange {
	key: DashboardTimeRangeKey;
	label: string;
}

export interface DashboardContextValue {
	timeRange: DashboardTimeRange;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
	value,
	children,
}: {
	value: DashboardContextValue;
	children: React.ReactNode;
}) {
	return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
	const ctx = useContext(DashboardContext);
	if (!ctx) {
		return { timeRange: { key: '30d', label: 'Last 30 days' } };
	}
	return ctx;
}
