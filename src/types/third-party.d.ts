declare module 'echarts' {
	export interface EChartsOption {
		[key: string]: unknown;
	}
}

declare module 'echarts-for-react' {
	import type { ComponentType } from 'react';

	const ReactECharts: ComponentType<Record<string, unknown>>;
	export default ReactECharts;
}

declare module 'react-grid-layout' {
	import type { ComponentType } from 'react';

	export interface Layout {
		i: string;
		x: number;
		y: number;
		w: number;
		h: number;
		minW?: number;
		minH?: number;
	}

	const GridLayout: ComponentType<Record<string, unknown>>;
	export function WidthProvider<T>(component: T): T;
	export default GridLayout;
}
