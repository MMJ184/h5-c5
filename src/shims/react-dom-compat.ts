// @ts-ignore - intentional deep import shim for legacy compatibility
import * as ReactDOMOriginal from '../../node_modules/react-dom/index.js';

// Provide a default export with findDOMNode for legacy libraries.
const fallbackFindDOMNode = (node: any) => {
	if (!node) return null;
	if (node.nodeType) return node;
	if ('current' in node && node.current) return node.current;
	return node;
};

const findDOMNode = (ReactDOMOriginal as any).findDOMNode ?? fallbackFindDOMNode;

const ReactDOMCompat = {
	...ReactDOMOriginal,
	findDOMNode,
};

// @ts-ignore - intentional deep re-export shim for legacy compatibility
export * from '../../node_modules/react-dom/index.js';
export { findDOMNode };
export default ReactDOMCompat;
