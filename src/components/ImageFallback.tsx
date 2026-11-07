import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ImageFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export const ImageFallback = ({ src, alt, className = '' }: ImageFallbackProps) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-gray-700 ${className}`}>
        <Sparkles size={24} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`object-cover ${className}`}
    />
  );
};
