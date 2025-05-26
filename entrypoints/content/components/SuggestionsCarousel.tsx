import React from 'react';

interface Suggestion {
  id: string;
  text: string;
}

interface SuggestionsCarouselProps {
  suggestions: Suggestion[];
  onSuggestionClick: (suggestionText: string) => void;
  theme: 'dark' | 'light';
}

const SuggestionsCarousel: React.FC<SuggestionsCarouselProps> = ({ suggestions, onSuggestionClick }) => {
  if (!suggestions.length) {
    return null;
  }

  const midPoint = Math.ceil(suggestions.length / 2);
  const row1Suggestions = suggestions.slice(0, midPoint);
  const row2Suggestions = suggestions.slice(midPoint);

  const renderRow = (rowSuggestions: Suggestion[], animationDirection: 'left' | 'right') => {
    if (!rowSuggestions.length) return null;
    const duplicatedSuggestions = [...rowSuggestions, ...rowSuggestions];

    return (
      <div className="overflow-hidden whitespace-nowrap w-full fadable-edges">
        <div 
          className={`flex animate-marquee-${animationDirection}`}
          style={{ animationDuration: `${rowSuggestions.length * 5}s` }}
        >
          {duplicatedSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.id}-${index}`}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="btn btn-sm btn-outline mx-2 whitespace-nowrap"
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 px-6 space-y-2">
      {renderRow(row1Suggestions, 'left')}
      {row2Suggestions.length > 0 && renderRow(row2Suggestions, 'right')}
      <style>{`
        .fadable-edges {
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        @keyframes marqueeLeft {
          0% { transform: translateX(0%) translateZ(0); }
          100% { transform: translateX(-50%) translateZ(0); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%) translateZ(0); }
          100% { transform: translateX(0%) translateZ(0); }
        }
        .animate-marquee-left {
          animation: marqueeLeft linear infinite;
        }
        .animate-marquee-right {
          animation: marqueeRight linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SuggestionsCarousel; 