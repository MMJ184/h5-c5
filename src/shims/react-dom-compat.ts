import * as ReactDOMOriginal from 'react-dom';

// Provide a default export with findDOMNode for legacy libraries.
const findDOMNode = (node: any) => {
	if (!node) return null;
	if (node.nodeType) return node;
	if ('current' in node && node.current) return node.current;
	return node;
};

const ReactDOMCompat = {
	...ReactDOMOriginal,
	findDOMNode,
};

export * from 'react-dom';
export default ReactDOMCompat;
