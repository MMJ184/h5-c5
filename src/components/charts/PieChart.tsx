import { theme } from 'antd';
import { useMemo } from 'react';

import EChart from './EChart';
import { type PieSeries } from './types';
import { legend } from './utils';

import type { EChartsOption } from 'echarts';

interface Props {
	data: PieSeries[];
	height?: number;
}

export default function PieChart({ data, height }: Props) {
	const { token } = theme.useToken();

	const option = useMemo<EChartsOption>(() => {
		return {
			legend: {
				bottom: 0,
				...legend(token),
			},
			series: [
				{
					type: 'pie',
					radius: ['40%', '70%'],
					data,
					label: {
						color: token.colorText,
						formatter: '{b}: {d}%',
					},
				},
			],
		};
	}, [data, token]);

	return <EChart option={option} height={height} />;
}
