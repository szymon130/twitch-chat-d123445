// src/components/TerminalLine.js

import MessageIcon from './MessageIcon'

/**
 * A single line in the terminal output.
 *
 * @param {Object} props - The component props.
 * @param {'success' | 'output' | 'command' | 'frontend-error' | 'message' | 'system' | 'error'| 'plusone'| 'minusone'| 'sword' | 'none'} props.type - The type of the terminal line, used for styling and behavior.
 * @param {string | JSX.Element} props.content - The content to display, can be plain text or a JSX element.
 * @returns {JSX.Element} The rendered terminal line.
 */
const TerminalLine = ({ type, content }) => {
  const typeClass = {
    error: 'text-red-400',
    system: 'text-blue-400',
    message: 'text-gray-300',
    'frontend-error': 'text-yellow-400',
    warning: 'text-yellow-400',
    info: 'text-yellow-400',
    command: 'text-green-400',
    output: 'text-white',
    success: 'text-green-400',
    plusone: 'text-green-400',
    minusone: 'text-red-400',
    sword: 'text-green-200',
    none: ''
  };

  return (
    <div className={`flex items-start font-mono text-sm leading-6 ${typeClass[type]} break-all`}>
      <div className="flex-shrink-0">
        {type === 'command' ? <span className="text-cyan-400 mr-2">$</span> : <MessageIcon type={type} />}
      </div>
      <div className="flex-grow">
        {typeof content === 'string' ? (
          <pre className="whitespace-pre-wrap break-words">{content}</pre>
        ) : (
          content()
        )}
      </div>
    </div>
  );
};

export default TerminalLine;