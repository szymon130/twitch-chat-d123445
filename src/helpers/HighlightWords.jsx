import React from 'react';

/**
 * A React helper component that highlights specific words within a given text or JSX input.
 * It splits the input by spaces and applies specified CSS classes and optional inline styles
 * to words that match a provided list of strings or regular expressions.
 *
 * @param {object} props - The component's props.
 * @param {string | React.ReactNode} props.textInput - The input text, which can be a string or JSX.
 * @param {(string | RegExp)[]} props.wordsToStyle - An array of words (strings) or regular expressions to which the styles/classes should be applied.
 * @param {string} props.className - The CSS class name(s) to apply to the matching words. This is required.
 * @param {React.CSSProperties} [props.style={}] - Optional inline CSS styles to apply to the matching words. Defaults to an empty object.
 * @param {boolean} [props.caseSensitive=false] - Optional. If true, string word matching will be case-sensitive. Regular expressions will use their own flags. Defaults to false.
 * @returns {React.ReactNode} A JSX element containing the processed text with highlighted words.
 */
const HighlightWords = ({ textInput, wordsToStyle, className, style = {}, caseSensitive = false }) => {
    // If no input is provided, return null to render nothing.
    if (textInput === null || textInput === undefined) {
        return null;
    }

    // Process wordsToStyle: convert strings to RegExp for consistent matching.
    // Escape special regex characters in strings to ensure literal matching.
    const processedWordsToStyle = wordsToStyle.map(item => {
        if (item instanceof RegExp) {
            return item; // If it's already a RegExp, use it as is.
        } else if (typeof item === 'string') {
            // Escape special characters in the string to treat it as a literal pattern.
            const escapedString = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Create a new RegExp. The '^' and '$' ensure whole word matching.
            // 'i' flag is added for case-insensitivity if caseSensitive is false.
            return new RegExp(`^${escapedString}$`, caseSensitive ? '' : 'i');
        }
        // If an unexpected type is passed, return it as is, though JSDoc guides against this.
        return item;
    });

    /**
     * Helper function to process a single text string.
     * It splits the string by spaces (preserving spaces) and applies styling to matching words.
     * @param {string} text - The text string to process.
     * @param {number} [keyPrefix=''] - A prefix for keys to ensure uniqueness when used in recursive calls.
     * @returns {Array<React.ReactNode>} An array of React nodes (<span> or React.Fragment) for rendering.
     */
    const processString = (text, keyPrefix = '') => {
        // Split the text by one or more spaces, keeping the spaces as separate elements in the array.
        // This regex /(\s+)/ captures the whitespace, allowing us to re-insert it correctly.
        const parts = text.split(/(\s+)/);

        return parts.map((part, index) => {
            // Use a unique key for each part for React's reconciliation.
            const key = `${keyPrefix}-${index}`;

            // If the part is just whitespace, return it as a fragment to preserve spacing.
            if (part.trim() === '') {
                return <React.Fragment key={key}>{part}</React.Fragment>;
            }

            // Check if the current part (word) should be styled using the processed regex patterns.
            const shouldStyle = processedWordsToStyle.some(regex =>
                regex.test(part)
            );

            // If the word matches, wrap it in a span with the specified class and style.
            if (shouldStyle) {
                return (
                    <span key={key} className={className} style={style}>
                        {part}
                    </span>
                );
            }
            // Otherwise, return the word as a fragment to maintain its original form.
            return <React.Fragment key={key}>{part}</React.Fragment>;
        });
    };

    /**
     * Recursively renders children of a React element, applying word highlighting to text nodes.
     * @param {React.ReactNode} children - The children to render.
     * @param {string} [keyPrefix=''] - A prefix for keys to ensure uniqueness across recursive calls.
     * @returns {React.ReactNode} The processed React children.
     */
    const renderChildren = (children, keyPrefix = '') => {
        // Use React.Children.map to safely iterate over children, handling different types.
        return React.Children.map(children, (child, index) => {
            const currentKeyPrefix = `${keyPrefix}-${index}`;

            // If the child is a string, process it using the string processing function.
            if (typeof child === 'string') {
                return processString(child, currentKeyPrefix);
            }
            // If the child is a valid React element, recursively process its children.
            else if (React.isValidElement(child)) {
                // Clone the element to pass down new children.
                return React.cloneElement(child, {
                    ...child.props, // Preserve original props
                    // Recursively call renderChildren for the current child's children.
                    children: renderChildren(child.props.children, currentKeyPrefix)
                });
            }
            // For other types (numbers, booleans, null, undefined), return them as is.
            return child;
        });
    };

    // Main rendering logic:
    // If the textInput is a string, directly process it.
    if (typeof textInput === 'string') {
        return <span>{processString(textInput)}</span>;
    }
    // If the textInput is JSX, recursively render and process its children.
    else {
        return <>{renderChildren(textInput)}</>;
    }
};

export default HighlightWords;