import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(null);

  const sizes = {
    sm: { star: 16, gap: 'gap-0.5' },
    md: { star: 24, gap: 'gap-1' },
    lg: { star: 32, gap: 'gap-1.5' },
  };

  const { star, gap } = sizes[size] || sizes.md;
  const display = hovered ?? value;

  const handleMouseMove = (e, index) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = x < rect.width / 2;
    setHovered(half ? index - 0.5 : index);
  };

  const handleClick = (e, index) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = x < rect.width / 2;
    const newRating = half ? index - 0.5 : index;
    // Click same rating to remove it
    onChange(newRating === value ? 0 : newRating);
  };

  return (
    <div
      className={`flex items-center ${gap}`}
      onMouseLeave={() => !readOnly && setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const filled = display >= index;
        const half = !filled && display >= index - 0.5;

        return (
          <div
            key={index}
            className={`relative ${readOnly ? '' : 'cursor-pointer'}`}
            style={{ width: star, height: star }}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={(e) => handleClick(e, index)}
          >
            {/* Empty star */}
            <svg
              width={star}
              height={star}
              viewBox="0 0 24 24"
              className="absolute inset-0 text-cinema-700"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>

            {/* Filled / half star */}
            {(filled || half) && (
              <svg
                width={star}
                height={star}
                viewBox="0 0 24 24"
                className="absolute inset-0 text-brand-500"
                fill="currentColor"
                style={half ? { clipPath: 'inset(0 50% 0 0)' } : {}}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
        );
      })}

      {!readOnly && display > 0 && (
        <span className="font-mono text-sm text-brand-400 ml-1">{display}</span>
      )}
      {readOnly && value > 0 && (
        <span className="font-mono text-xs text-brand-400 ml-1">{value}</span>
      )}
    </div>
  );
}