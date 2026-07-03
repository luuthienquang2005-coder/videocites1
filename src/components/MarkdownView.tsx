import React from "react";

interface MarkdownViewProps {
  content: string;
}

export default function MarkdownView({ content }: MarkdownViewProps) {
  const lines = content.split("\n");

  return (
    <div className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2 tracking-tight">
              {trimmed.substring(2)}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-lg font-semibold text-gray-900 dark:text-white mt-3 mb-1 tracking-tight">
              {trimmed.substring(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-1">
              {trimmed.substring(4)}
            </h3>
          );
        }

        // Bullets
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          // Check for bold inside bullet
          let text = trimmed.substring(2);
          const boldMatch = text.match(/\*\*(.*?)\*\*/);
          if (boldMatch) {
            const parts = text.split(/\*\*(.*?)\*\*/);
            return (
              <ul key={idx} className="list-disc pl-5 my-1 space-y-1">
                <li className="text-gray-600 dark:text-gray-300">
                  {parts[0]}
                  <strong className="font-semibold text-gray-900 dark:text-white">{parts[1]}</strong>
                  {parts[2]}
                </li>
              </ul>
            );
          }
          return (
            <ul key={idx} className="list-disc pl-5 my-1">
              <li className="text-gray-600 dark:text-gray-300">{text}</li>
            </ul>
          );
        }

        // Horizontal Line
        if (trimmed === "---") {
          return <hr key={idx} className="border-gray-200 dark:border-gray-800 my-4" />;
        }

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Standard line with potential inline bold text
        const boldMatch = trimmed.match(/\*\*(.*?)\*\*/);
        if (boldMatch) {
          const parts = trimmed.split(/\*\*(.*?)\*\*/);
          return (
            <p key={idx} className="my-1">
              {parts[0]}
              <strong className="font-semibold text-gray-900 dark:text-white">{parts[1]}</strong>
              {parts[2]}
            </p>
          );
        }

        // Support for emphasis _italic_
        const italicMatch = trimmed.match(/\*(.*?)\*/);
        if (italicMatch) {
          const parts = trimmed.split(/\*(.*?)\*/);
          return (
            <p key={idx} className="my-1">
              {parts[0]}
              <em className="italic text-gray-600 dark:text-gray-400">{parts[1]}</em>
              {parts[2]}
            </p>
          );
        }

        return <p key={idx} className="my-1">{trimmed}</p>;
      })}
    </div>
  );
}
