// Mock react-syntax-highlighter for Jest tests
// v16+ is ESM-only and causes Jest parsing issues

export const Prism = ({ children, ...props }) => {
  return children;
};

export default { Prism };

