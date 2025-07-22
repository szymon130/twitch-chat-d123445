// src/components/TerminalLine.js
import React from 'react';
import MessageIcon from './MessageIcon';
import RehydratedMessage from './RehydratedMessage'; // Import the new component

/**
 * A single line in the terminal output.
 *
 * @param {Object} props - The component props.
 * @param {'success' | 'output' | 'command' | 'frontend-error' | 'message' | 'system' | 'error'| 'plusone'| 'minusone'| 'sword' | 'none'} props.type - The type of the terminal line, used for styling and behavior.
 * @param {string | JSX.Element | function} props.content - The content to display, can be plain text, a JSX element, or a function that returns JSX.
 * @param {string} props.rehydrateType - Optional. Type identifier for rehydrating content.
 * @param {any} props.rehydrateData - Optional. Data needed to rehydrate content.
 * @param {function} props.dispatch - The dispatch function from TerminalContext.
 * @param {object} props.state - The state from TerminalContext.
 * @returns {JSX.Element} The rendered terminal line.
 */
const TerminalLine = ({ type, content, index, rehydrateType, rehydrateData, dispatch, state }) => {
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

  const icon = type === 'command' ? <span className="text-cyan-400">$</span> : <MessageIcon type={type} />;

  let renderedContent;
  if (rehydrateType) {
    // If a rehydrateType is specified, delegate to RehydratedMessage
    renderedContent = <RehydratedMessage line={{ type, content, rehydrateType, rehydrateData }} dispatch={dispatch} state={state} />;
  } else if (typeof content === 'function') {
    // If content is a function (e.g., /debug output during the current session), call it.
    // This path is taken for messages generated in the current session before being saved/reloaded.
    renderedContent = content(icon);
  } else {
    // For all other cases (plain strings, or string placeholders from localStorage for JSX/functions)
    renderedContent =
      <div className="px-2 py-1">
        {icon} {content}
      </div>;
  }


  return (
    <div
      className={`terminal-line text-sm ${typeClass[type]} break-all`}
      style={{ backgroundColor: index % 2 === 0 ? '#ffffff08' : 'transparent' }}
    >
      {renderedContent}
    </div>
  );
};

export default TerminalLine;