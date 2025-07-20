// Icon for different message types
const MessageIcon = ({ type }) => {
  const iconMap = {
    error: {
      path: 'M10 1.9L0 18.1h20L10 1.9zm0 13.8c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3 1.3.6 1.3 1.3-.6 1.3-1.3 1.3zm0-3.8c-.7 0-1.3-.6-1.3-1.3V7.8c0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3v3.8c0 .7-.6 1.3-1.3 1.3z'
    },
    warning: {
      path: 'M10 1.9L0 18.1h20L10 1.9zm0 13.8c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3 1.3.6 1.3 1.3-.6 1.3-1.3 1.3zm0-3.8c-.7 0-1.3-.6-1.3-1.3V7.8c0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3v3.8c0 .7-.6 1.3-1.3 1.3z'
    },
    system: {
      path: 'M10 20c-5.5 0-10-4.5-10-10S4.5 0 10 0s10 4.5 10 10-4.5 10-10 10zm0-2c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8zm-1-11h2v6h-2zm0 7h2v2h-2z'
    },
    message: {
      path: 'M18 6H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM6 8h12v2H6V8zm12 6H6v-2h12v2z'
    },
    'frontend-error': {
      path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
    },
    command: {
      path: 'M5.88 4.12L13.76 12l-7.88 7.88L8 22l10-10L8 2z'
    },
    output: {
      path: 'M4 18h16v-2H4v2zm0-5h16v-2H4v2zm0-5h16V6H4v2z'
    },
    success: {
      path: 'M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 15l-4-4 1.41-1.41L9 12.17l4.59-4.59L15 9l-6 6z'
    },
    plusone: {
      path: false,
      text: '+'
    },
    minusone: {
      path: false,
      text: '-'
    },
    sword: {
      path: 'M 4 8 L 10 1 L 13 0 L 12 3 L 5 9 C 6 10 6 11 7 10 C 7 11 8 12 7 12 A 1.42 1.42 0 0 1 6 13 A 5 5 0 0 0 4 10 Q 3.5 9.9 3.5 10.5 T 2 11.8 T 1.2 11 T 2.5 9.5 T 3 9 A 5 5 90 0 0 0 7 A 1.42 1.42 0 0 1 1 6 C 1 5 2 6 3 6 C 2 7 3 7 4 8 M 10 1 L 10 3 L 12 3 L 10.2 2.8 L 10 1'
    },
    info: {
      path: false,
      text: 'O'
    },
    none: {
      path: false,
      text: '>'
    }
  };
  const colorClass = {
    error: 'text-red-400',
    system: 'text-blue-400',
    message: 'text-gray-300',
    'frontend-error': 'text-yellow-400',
    info: 'text-yellow-400',
    warning: 'text-yellow-400',
    command: 'text-green-400',
    output: 'text-gray-200',
    success: 'text-green-400',
    plusone: 'text-green-400',
    minusone: 'text-red-400',
    sword: 'text-green-200',
    none: ''
  }[type];

  if (iconMap[type] && iconMap[type].path) {
    return (
      <svg style={{ display: 'inline-block' }} className={`w-4 h-4 inline-block flex-shrink-0 ${colorClass}`} viewBox="0 0 20 20" fill="currentColor">
        <path d={iconMap[type].path} />
      </svg>
    );
  } else
    return (
      <div className={`w-4 h-4 inline-block flex-shrink-0 ${colorClass}`} viewBox="0 0 20 20" fill="currentColor">
        {(iconMap[type] && iconMap[type].text) || '-'}
      </div>
    );

};

export default MessageIcon;