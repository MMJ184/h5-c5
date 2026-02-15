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
		category: 'Overview',
		defaultW: 4,
		defaultH: 4,
	},
	{
		type: 'buildStatus',
		title: 'Build Status',
		description: 'Latest CI builds with status.',
		category: 'Pipelines',
		defaultW: 4,
		defaultH: 5,
	},
	{
		type: 'recentActivity',
		title: 'Recent Activity',
		description: 'Last commits / work items.',
		category: 'Boards',
		defaultW: 6,
		defaultH: 6,
	},
	{
		type: 'todo',
		title: 'My To-Dos',
		description: 'Personal tasks list.',
		category: 'Boards',
		defaultW: 3,
		defaultH: 5,
	},
	{
		type: 'notes',
		title: 'Notes',
		description: 'Free-form notes widget.',
		category: 'Collaboration',
		defaultW: 3,
		defaultH: 4,
		minH: 3,
	},
	{
		type: 'timeline',
		title: 'Release Timeline',
		description: 'Upcoming releases / sprints.',
		category: 'Releases',
		defaultW: 6,
		defaultH: 5,
	},
	{
		type: 'serverHealth',
		title: 'Server Health',
		description: 'Environment health indicators.',
		category: 'Monitoring',
		defaultW: 4,
		defaultH: 5,
	},
	{
		type: 'chartPlaceholder',
		title: 'Chart Placeholder',
		description: 'Area chart placeholder for metrics.',
		category: 'Analytics',
		defaultW: 6,
		defaultH: 6,
	},
	{
		type: 'teamSummary',
		title: 'Team Summary',
		description: 'Who’s online, active tasks, etc.',
		category: 'Collaboration',
		defaultW: 4,
		defaultH: 5,
	},
	{
		type: 'alertList',
		title: 'Alerts',
		description: 'List of open alerts/incidents.',
		category: 'Monitoring',
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
