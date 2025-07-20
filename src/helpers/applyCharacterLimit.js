export default function applyCharacterLimit(command, activeChannel) {
    const MAX_LENGTH = 500;

    // For normal messages
    if (!command.startsWith('/')) {
        return command.substring(0, MAX_LENGTH);
    }

    // For /say commands
    if (command.startsWith('/say') && activeChannel) {
        const prefix = `/say #${activeChannel} `;
        const message = command.substring(prefix.length);

        if (message.length > MAX_LENGTH) {
            return prefix + message.substring(0, MAX_LENGTH);
        }
        return command;
    }

    return command;
}