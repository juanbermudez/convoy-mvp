import React from 'react';

interface ActivityFeedItemProps {
  timestamp: string;
  author: string;
  content: string;
}

const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({ timestamp, author, content }) => {
  // Placeholder values for demonstration during UI build
  const displayTimestamp = timestamp || "2 hours ago";
  const displayAuthor = author || "User";
  const displayContent = content || "Task status changed to 'In Progress'.";
  
  // Determine if author is AI or human for styling
  const isAI = displayAuthor.toLowerCase().includes('ai') || displayAuthor.toLowerCase().includes('cline');
  
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <span className={`font-medium ${isAI ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
            {displayAuthor}
          </span>
          {isAI && (
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              AI
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{displayTimestamp}</span>
      </div>
      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        {displayContent}
      </div>
    </div>
  );
};

export default ActivityFeedItem;
