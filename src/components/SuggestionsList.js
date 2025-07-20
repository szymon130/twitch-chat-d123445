import React, { useEffect, useRef } from 'react';
import { useTerminal } from '../context/TerminalContext';
import Image from '../helpers/Image'


const accesMap = new Map();
accesMap.set(0, { 'color': '#777777ff', 'text': 'Everyone' });
accesMap.set(1, { 'color': '#54de31ff', 'text': 'Subscriber' });
accesMap.set(2, { 'color': '#317cdeff', 'text': 'Regular' });
accesMap.set(3, { 'color': '#DE3163ff', 'text': 'Vip' });
accesMap.set(4, { 'color': '#deb031ff', 'text': 'Moderator' });
accesMap.set(5, { 'color': '#de5431ff', 'text': 'Super Moderator' });
accesMap.set(6, { 'color': '#de3131ff', 'text': 'Broadcaster' });

function SuggestionsList({ suggestions, activeSuggestionIndex, onSelect }) {
    const { state } = useTerminal();
    const activeRef = useRef(null);

    useEffect(() => {
        // Scroll to active suggestion when it changes
        if (activeRef.current) {
            activeRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [activeSuggestionIndex]);

    return (
        <ul style={{ maxHeight: '70vh', maxWidth: '100vw' }} className="absolute bottom-full mb-1 overflow-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
            {suggestions.map(({ cmd: suggestion, properties }, index) => {
                const commandInfo = state.availableCommands[suggestion];
                const isActive = index === activeSuggestionIndex;
                if (!properties)
                    return (
                        <li
                            key={index}
                            className={`px-3 py-2 cursor-pointer ${isActive ? 'bg-white' : 'hover:bg-gray-700'} ${isActive ? 'text-black' : 'hover:bg-gray-700'}`}
                            onClick={() => onSelect(suggestion)}
                            ref={isActive ? activeRef : null}
                        >

                            <span className="font-mono">{suggestion} </span>
                            {commandInfo && (
                                <span className={`${isActive ? 'text-blue-900' : 'text-blue-400 hover:bg-gray-700'} ml-2 truncate`}>
                                    {commandInfo.description}
                                </span>
                            )}

                        </li>
                    );
                else if (properties.type === 'emote') {
                    return (
                        <li
                            key={index}
                            className={`px-3 py-2 cursor-pointer ${isActive ? 'bg-white' : 'hover:bg-gray-700'} flex items-center`}
                            onClick={() => onSelect(suggestion)}
                            ref={isActive ? activeRef : null}
                        >
                            <Image code={suggestion} urls={properties.urls} />
                            <span className="font-mono ml-2">{suggestion}</span>
                        </li>
                    );
                }
                else
                    return (
                        <li
                            key={index}
                            className={`px-3 py-2 cursor-pointer ${isActive ? 'bg-white' : 'hover:bg-gray-700'} ${isActive ? 'text-black' : 'hover:bg-gray-700'}`}
                            onClick={() => onSelect(suggestion)}
                            ref={isActive ? activeRef : null}
                        >

                            <span className='mr-2' style={{ color: properties.color }}>
                                [{properties.platform}]
                            </span>
                            <span className='mr-2' style={{ color: accesMap.get(properties.level)?.color }}>{accesMap.get(properties.level)?.text}</span>
                            <span className="font-mono">{suggestion} </span>
                            {
                                properties.aliases && (
                                    <>
                                        {properties.aliases.map((a) => {
                                            return <span className='ml-2'>{a}</span>
                                        })}
                                    </>
                                )
                            }
                            {properties && (
                                <span className={`${isActive ? 'text-blue-900' : 'text-blue-400 hover:bg-gray-700'} ml-2`}>
                                    {properties.description}
                                </span>
                            )}

                        </li>
                    );
            })}
        </ul>
    );
}

export default SuggestionsList;