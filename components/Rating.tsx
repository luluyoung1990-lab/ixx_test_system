
import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

const Rating: React.FC<RatingProps> = ({ value, onChange, max = 5 }) => {
  return (
    <div className="flex space-x-1">
      {[...Array(max)].map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className="focus:outline-none transition-transform active:scale-95"
        >
          <Star
            size={16}
            className={`${
              i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default Rating;
