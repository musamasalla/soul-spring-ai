import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
}

export function ResponsiveImage({ 
  src, 
  alt, 
  sizes = '100vw', 
  className = '',
  width,
  height,
  priority = false,
  onLoad
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Handle image loading
  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
    console.warn(`Failed to load image: ${src}`);
  };
  
  // Generate srcSet if image is not an SVG or external URL
  const getSrcSet = () => {
    // Skip for SVGs, GIFs, or external URLs
    if (src.includes('.svg') || src.includes('.gif') || src.startsWith('http')) {
      return undefined;
    }
    
    const basePath = src.substring(0, src.lastIndexOf('.'));
    const extension = src.substring(src.lastIndexOf('.'));
    
    return [400, 800, 1200, 1600]
      .map(width => `${basePath}-${width}w${extension} ${width}w`)
      .join(', ');
  };
  
  // Preload high priority images
  useEffect(() => {
    if (priority && src) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      document.head.appendChild(preloadLink);
      
      return () => {
        document.head.removeChild(preloadLink);
      };
    }
  }, [priority, src]);
  
  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        !loaded && !error ? 'bg-secondary/20 animate-pulse' : '',
        className
      )}
      style={{ width, height }}
    >
      {!error ? (
        <img
          src={src}
          srcSet={getSrcSet()}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-muted-foreground text-sm">
          {alt || 'Image failed to load'}
        </div>
      )}
    </div>
  );
}

// Export a function to preload critical images
export function preloadCriticalImages(images: string[]) {
  return Promise.all(
    images.map((src) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });
    })
  );
} 