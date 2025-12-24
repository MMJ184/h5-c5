import { theme } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';

import type { EChartsOption } from 'echarts';

interface Props {
	option: EChartsOption;
	height?: number;
}

export default function EChart({ option, height = 260 }: Props) {
	const { token } = theme.useToken();

	const mergedOption = useMemo<EChartsOption>(() => {
		return {
			backgroundColor: 'transparent',
			textStyle: {
				color: token.colorText,
				fontFamily: token.fontFamily,
			},
			tooltip: {
				backgroundColor: token.colorBgElevated,
				borderColor: token.colorBorder,
				textStyle: { color: token.colorText },
			},
			...option,
		};
	}, [option, token]);

	return <ReactECharts option={mergedOption} style={{ height }} />;
}
