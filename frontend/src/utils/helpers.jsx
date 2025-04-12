import React from "react";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Formats message content with markdown rendering and code highlighting
 * Detects and processes code blocks while preserving regular markdown
 *
 * @param {string} content - The message text to format
 * @param {Object} copySuccess - State object tracking successfully copied code blocks
 * @param {Function} setCopySuccess - State setter for copy success status
 * @returns {React.ReactNode} - Formatted message with markdown and code blocks
 */
export const formatMessageContent = (content, copySuccess, setCopySuccess) => {
  if (!content) return null;

  // Extract code blocks from content using regex pattern
  const parts = [];
  let lastIndex = 0;
  const regex =
    /```(python|javascript|js|html|css|bash|shell|sql|json|typescript|tsx|jsx)?\s*([\s\S]*?)```/g;
  let match;

  // Parse content and separate markdown from code blocks
  while ((match = regex.exec(content)) !== null) {
    // Add text before the code block as markdown
    if (match.index > lastIndex) {
      parts.push({
        type: "markdown",
        content: content.substring(lastIndex, match.index),
      });
    }

    // Extract language and code from the match
    const language = match[1] || "text";
    const code = match[2].trim();

    // Add code block
    parts.push({
      type: "code",
      language,
      content: code,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last code block
  if (lastIndex < content.length) {
    parts.push({
      type: "markdown",
      content: content.substring(lastIndex),
    });
  }

  // If no code blocks found, render entire content as markdown
  if (parts.length === 0) {
    return (
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom styling for inline code
            code({ node, inline, className, children, ...props }) {
              return inline ? (
                <code
                  className="bg-gray-800 px-1 py-0.5 rounded text-gray-300"
                  {...props}
                >
                  {children}
                </code>
              ) : null;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Render each part (markdown or code block) with appropriate formatting
  return parts.map((part, index) => {
    if (part.type === "markdown") {
      // Render markdown content
      return (
        <div key={index} className="markdown-content mb-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for inline code
              code({ node, inline, className, children, ...props }) {
                return inline ? (
                  <code
                    className="bg-gray-800 px-1 py-0.5 rounded text-gray-300"
                    {...props}
                  >
                    {children}
                  </code>
                ) : null;
              },
            }}
          >
            {part.content}
          </ReactMarkdown>
        </div>
      );
    } else {
      // Render code block with syntax highlighting and copy functionality
      return (
        <div key={index} className="mb-4">
          <div className="bg-black rounded-md overflow-hidden border-2 border-gray-700">
            {/* Code block header with language label and copy button */}
            <div className="bg-gray-700 px-4 py-2 text-lg font-mono flex justify-between items-center">
              <span className="capitalize">{part.language}</span>
              <button
                className="text-gray-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(part.content).then(() => {
                    setCopySuccess({ [index]: true });
                    setTimeout(() => setCopySuccess({}), 2000);
                  });
                }}
              >
                {copySuccess[index] ? (
                  <>
                    <Check size={14} className="text-green-500" />
                    <span className="text-xs">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </button>
            </div>
            {/* Syntax highlighted code block */}
            <SyntaxHighlighter
              language={part.language === "js" ? "javascript" : part.language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "1rem",
                backgroundColor: "black",
              }}
              wrapLongLines={true}
            >
              {part.content}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    }
  });
};
