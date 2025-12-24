import { theme } from 'antd';
import { useMemo } from 'react';

import EChart from './EChart';
import { type BarSeries } from './types';
import { axis } from './utils';

import type { EChartsOption } from 'echarts';

interface Props {
	data: BarSeries[];
	height?: number;
}

export default function BarChart({ data, height }: Props) {
	const { token } = theme.useToken();

	const option = useMemo<EChartsOption>(() => {
		return {
			xAxis: {
				type: 'category',
				data: data.map((d) => d.x),
				...axis(token),
			},
			yAxis: {
				type: 'value',
				...axis(token),
			},
			series: [
				{
					type: 'bar',
					data: data.map((d) => d.y),
					barWidth: '60%',
					itemStyle: {
						color: token.colorPrimary,
						borderRadius: [4, 4, 0, 0],
					},
				},
			],
		};
	}, [data, token]);

	return <EChart option={option} height={height} />;
}
