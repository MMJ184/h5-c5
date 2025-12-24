// src/widgets/types.ts

export type WidgetType =
	| 'kpi'
	| 'buildStatus'
	| 'recentActivity'
	| 'todo'
	| 'notes'
	| 'timeline'
	| 'serverHealth'
	| 'chartPlaceholder'
	| 'teamSummary'
	| 'alertList';

export interface WidgetDefinition {
	type: WidgetType;
	title: string;
	description: string;
	defaultW: number;
	defaultH: number;
	minW?: number;
	minH?: number;
}
