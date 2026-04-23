'use client';
import { useState } from 'react';

export default function RatingStars({ rating, onRate, disabled = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (newRating) => {
    if (!disabled) {
      onRate(newRating);
    }
  };

  const handleMouseEnter = (starRating) => {
    if (!disabled) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '5px', margin: '10px 0' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        return (
          <span
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            style={{
              fontSize: '24px',
              cursor: disabled ? 'default' : 'pointer',
              color: isFilled ? '#ffc107' : '#ccc',
              transition: 'color 0.2s ease',
              opacity: disabled ? 0.6 : 1
            }}
            title={disabled ? 'Please login to rate' : `Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}