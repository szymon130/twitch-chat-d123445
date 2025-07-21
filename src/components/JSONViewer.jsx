import React, { useState } from 'react';

const JSONViewer = ({ data }) => {
    const [expanded, setExpanded] = useState({});
    const [contextMenu, setContextMenu] = useState(null);

    const toggleExpand = (path) => {
        setExpanded(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    const handleContextMenu = (e, path, value) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            path,
            value
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setContextMenu(null);
    };

    const renderValue = (value, path = '') => {
        if (value === null) return <span className="text-purple-400">null</span>;
        if (typeof value === 'boolean') return <span className="text-blue-400">{value.toString()}</span>;
        if (typeof value === 'number') return <span className="text-green-400">{value}</span>;
        if (typeof value === 'string') return <span className="text-yellow-400">"{value}"</span>;

        if (Array.isArray(value)) {
            return (
                <div className="pl-4">
                    <span
                        className="cursor-pointer text-gray-400"
                        onClick={() => toggleExpand(path)}
                    >
                        [{expanded[path] ? '−' : '+'}] [
                    </span>
                    {expanded[path] && (
                        <div className="pl-4">
                            {value.map((item, index) => (
                                <div key={index}>
                                    {renderValue(item, `${path}[${index}]`)}
                                    {index < value.length - 1 && ','}
                                </div>
                            ))}
                        </div>
                    )}
                    <span>]</span>
                </div>
            );
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            return (
                <div className="pl-4">
                    <span
                        className="cursor-pointer text-gray-400"
                        onClick={() => toggleExpand(path)}
                    >
                        [{expanded[path] ? '−' : '+'}] {'{'}
                    </span>
                    {expanded[path] && (
                        <div className="pl-4">
                            {keys.map((key, index) => (
                                <div
                                    key={key}
                                    onContextMenu={(e) => handleContextMenu(e, `${path}.${key}`, value[key])}
                                >
                                    <span className="text-orange-400">"{key}": </span>
                                    {renderValue(value[key], `${path}.${key}`)}
                                    {index < keys.length - 1 && ','}
                                </div>
                            ))}
                        </div>
                    )}
                    <span>{'}'}</span>
                </div>
            );
        }

        return <span>{String(value)}</span>;
    };

    return (
        <div className="relative">
            {renderValue(data)}
            {contextMenu && (
                <div
                    className="absolute bg-gray-800 border border-gray-700 rounded shadow-lg z-50"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
                        onClick={() => copyToClipboard(JSON.stringify(contextMenu.value, null, 2))}
                    >
                        Copy Property
                    </div>
                    <div
                        className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
                        onClick={() => copyToClipboard(contextMenu.path)}
                    >
                        Copy Path
                    </div>
                </div>
            )}
        </div>
    );
};

export default JSONViewer;