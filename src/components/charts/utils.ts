import type { GlobalToken } from 'antd/es/theme/interface';

export function axis(token: GlobalToken) {
	return {
		axisLabel: { color: token.colorTextSecondary },
		axisLine: { lineStyle: { color: token.colorBorder } },
		splitLine: { lineStyle: { color: token.colorBorderSecondary } },
	};
}

export function legend(token: GlobalToken) {
	return {
		textStyle: { color: token.colorText },
	};
}
