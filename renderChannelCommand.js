/**
 * Render channel command with platform-specific formatting
 * 
 * @param {string} platform 
 * @param {Object} command 
 * @returns {JSX.Element}
 */
export default function renderChannelCommand(platform, command) {
    return (
        <li className="flex flex-col">
            <div className="flex items-baseline">
                <span className="text-purple-400 font-mono">!{command.commandId}</span>
                {command.aliases?.length > 0 && (
                    <span className="text-gray-500 text-sm ml-2">
                        (aliases: {command.aliases.join(', ')})
                    </span>
                )}
            </div>
            <div className="text-gray-300">{command.description}</div>
            <div className="text-xs text-gray-500 mt-1">
                <span>Platform: {platform}</span>
                {command.cost > 0 && <span className="ml-2">Cost: {command.cost}</span>}
                {command.cooldown && (
                    <span className="ml-2">
                        Cooldown: {command.cooldown.user}/{command.cooldown.global}s
                    </span>
                )}
            </div>
        </li>
    );
}