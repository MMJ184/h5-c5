import { CALENDAR_CONFIG } from './calendar.config';

export default function TimeColumn() {
	const { hours, slotHeight } = CALENDAR_CONFIG;

	return (
		<div style={{ width: 64 }}>
			{Array.from({ length: hours.end - hours.start }).map((_, i) => {
				const hour = hours.start + i;
				return (
					<div
						key={hour}
						style={{
							height: slotHeight * 60,
							fontSize: 12,
							color: '#888',
							paddingTop: 2,
						}}
					>
						{String(hour).padStart(2, '0')}:00
					</div>
				);
			})}
		</div>
	);
}
