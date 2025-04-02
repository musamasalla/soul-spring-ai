import React from 'react';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/images/logo.png';

export interface LogoProps {
  variant?: 'dark' | 'light' | 'colored';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  onClick?: () => void;
  useSvg?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'colored',
  size = 'md',
  className,
  showText = true,
  onClick,
  useSvg = false
}) => {
  // Define size classes
  const sizeClasses = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
    xl: 'h-16 w-16'
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 cursor-pointer", 
        className
      )}
      onClick={onClick}
    >
      {useSvg ? (
        <img 
          src="/cropped_favicon.png"
          alt="Tranquil Mind Logo"
          className={cn(sizeClasses[size])}
        />
      ) : (
        <img 
          src={logoImage}
          alt="Tranquil Mind Logo"
          className={cn(sizeClasses[size])}
        />
      )}
      
      {showText && (
        <span className={cn(
          "font-bold",
          size === 'sm' ? 'text-lg' : 
          size === 'md' ? 'text-xl' : 
          size === 'lg' ? 'text-2xl' : 'text-3xl'
        )}>
          Tranquil<span className="text-primary">Mind</span>
        </span>
      )}
    </div>
  );
};

export default Logo; 