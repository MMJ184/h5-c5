import React, { useEffect, useMemo, useState } from 'react';

import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	height?: number;
	readOnly?: boolean;
}

const toolbarOptions = [
	['bold', 'italic', 'underline', 'strike'],
	[{ list: 'ordered' }, { list: 'bullet' }],
	[{ align: [] }],
	['link'],
	['clean'],
];

export default function RichTextEditor({
	value,
	onChange,
	placeholder,
	height = 160,
	readOnly,
}: RichTextEditorProps) {
	const [Quill, setQuill] = useState<React.ComponentType<any> | null>(null);

	useEffect(() => {
		let mounted = true;
		import('react-quill')
			.then((mod) => {
				if (!mounted) return;
				setQuill(() => mod.default);
			})
			.catch(() => {
				setQuill(null);
			});

		return () => {
			mounted = false;
		};
	}, []);

	const modules = useMemo(() => ({ toolbar: toolbarOptions }), []);

	if (!Quill) {
		return (
			<div
				style={{
					height,
					borderRadius: 10,
					border: '1px solid rgba(0,0,0,0.08)',
					padding: 12,
					color: '#888',
				}}
			>
				Loading editor…
			</div>
		);
	}

	return (
		<div style={{ borderRadius: 10, overflow: 'hidden' }}>
			<Quill
				theme="snow"
				value={value ?? ''}
				onChange={(content) => onChange?.(content)}
				modules={modules}
				placeholder={placeholder}
				readOnly={readOnly}
				style={{ height }}
			/>
		</div>
	);
}
