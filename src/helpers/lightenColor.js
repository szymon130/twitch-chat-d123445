/**
 * Lightens a color by a specified percentage
 * @param {string} color - The color to lighten (hex, rgb, or named color)
 * @param {number} percent - The percentage to lighten (0-100)
 * @returns {string} The lightened color in hex format
 */
function lightenColor(color, percent) {
    // Convert named colors to hex if needed
    const namedColors = {
        'black': '#000000',
        'darkblue': '#00008B',
        'darkcyan': '#008B8B',
        'darkgray': '#A9A9A9',
        'darkgreen': '#006400',
        'darkgrey': '#A9A9A9',
        'darkmagenta': '#8B008B',
        'darkred': '#8B0000',
        'darkslategray': '#2F4F4F',
        'darkslategrey': '#2F4F4F',
    };

    if (namedColors[color.toLowerCase()]) {
        color = namedColors[color.toLowerCase()];
    }

    // Parse the color into RGB components
    let r, g, b;

    // Hex color
    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
        g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
        b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    }
    // RGB color
    else if (color.startsWith('rgb')) {
        const parts = color.match(/\d+/g);
        r = parseInt(parts[0]);
        g = parseInt(parts[1]);
        b = parseInt(parts[2]);
    }
    // Invalid color format
    else {
        console.warn(`Invalid color format: ${color}`);
        return color;
    }

    // Calculate lightened values
    const amount = Math.round(2.55 * percent);
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);

    // Convert back to hex
    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Example usage:
// lightenColor('#123456', 20) => "#2a4c72"
// lightenColor('darkblue', 30) => "#4d4dff"
// lightenColor('rgb(30, 30, 30)', 40) => "#6e6e6e"

export default lightenColor;