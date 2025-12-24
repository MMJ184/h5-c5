// src/widgets/WidgetRegistry.tsx
import React from 'react';

import AlertListWidget from './AlertListWidget';
import BuildStatusWidget from './BuildStatusWidget';
import ChartPlaceholderWidget from './ChartPlaceholderWidget';
import KpiWidget from './KpiWidget';
import NotesWidget from './NotesWidget';
import RecentActivityWidget from './RecentActivityWidget';
import ServerHealthWidget from './ServerHealthWidget';
import TeamSummaryWidget from './TeamSummaryWidget';
import TimelineWidget from './TimelineWidget';
import TodoWidget from './TodoWidget';

import type { WidgetDefinition, WidgetType } from './types.ts';

export const widgetDefinitions: WidgetDefinition[] = [
	{
		type: 'kpi',
		title: 'Key Metrics',
		description: 'Shows key numbers like builds, deployments, failures.',
		defaultW: 4,
		defaultH: 4,
	},
	{
		type: 'buildStatus',
		title: 'Build Status',
		description: 'Latest CI builds with status.',
		defaultW: 4,
		defaultH: 5,
	},
	{
		type: 'recentActivity',
		title: 'Recent Activity',
		description: 'Last commits / work items.',
		defaultW: 6,
		defaultH: 6,
	},
	{
		type: 'todo',
		title: 'My To-Dos',
		description: 'Personal tasks list.',
		defaultW: 3,
		defaultH: 5,
	},
	{
		type: 'notes',
		title: 'Notes',
		description: 'Free-form notes widget.',
		defaultW: 3,
		defaultH: 4,
		minH: 3,
	},
	{
		type: 'timeline',
		title: 'Release Timeline',
		description: 'Upcoming releases / sprints.',
		defaultW: 6,
		defaultH: 5,
	},
	{
		type: 'serverHealth',
		title: 'Server Health',
		description: 'Environment health indicators.',
		defaultW: 4,
		defaultH: 5,
	},
	{
		type: 'chartPlaceholder',
		title: 'Chart Placeholder',
		description: 'Area chart placeholder for metrics.',
		defaultW: 6,
		defaultH: 6,
	},
	{
		type: 'teamSummary',
		title: 'Team Summary',
		description: 'Who’s online, active tasks, etc.',
		defaultW: 4,
		defaultH: 5,
	},
	{
		type: 'alertList',
		title: 'Alerts',
		description: 'List of open alerts/incidents.',
		defaultW: 4,
		defaultH: 5,
	},
];

export const widgetRegistry: Record<WidgetType, React.ComponentType> = {
	kpi: KpiWidget,
	buildStatus: BuildStatusWidget,
	recentActivity: RecentActivityWidget,
	todo: TodoWidget,
	notes: NotesWidget,
	timeline: TimelineWidget,
	serverHealth: ServerHealthWidget,
	chartPlaceholder: ChartPlaceholderWidget,
	teamSummary: TeamSummaryWidget,
	alertList: AlertListWidget,
};

export const getWidgetDefinition = (type: WidgetType) => widgetDefinitions.find((w) => w.type === type);

export const getWidgetComponentByType = (type: WidgetType) => widgetRegistry[type];
