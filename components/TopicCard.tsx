import React from 'react';
import { ThesisTopic } from '../types';

interface TopicCardProps {
  topic: ThesisTopic;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{topic.title}</h3>
      <p className="text-gray-600 mb-4 text-justify leading-relaxed">{topic.description}</p>

      {topic.keywords && topic.keywords.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">کلمات کلیدی:</p>
          <div className="flex flex-wrap gap-2">
            {topic.keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {topic.potentialResearchQuestions && topic.potentialResearchQuestions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">پرسش‌های تحقیقاتی احتمالی:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            {topic.potentialResearchQuestions.map((question, index) => (
              <li key={index} className="text-justify">{question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TopicCard;