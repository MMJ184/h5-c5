import { theme } from 'antd';
import { useMemo } from 'react';

import EChart from './EChart';
import { type LineSeries } from './types';
import { axis } from './utils';

import type { EChartsOption } from 'echarts';

interface Props {
	data: LineSeries[];
	height?: number;
}

export default function LineChart({ data, height }: Props) {
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
					type: 'line',
					data: data.map((d) => d.y),
					smooth: true,
					symbol: 'circle',
					symbolSize: 6,
					lineStyle: { color: token.colorPrimary, width: 3 },
					itemStyle: { color: token.colorPrimary },
				},
			],
		};
	}, [data, token]);

	return <EChart option={option} height={height} />;
}
