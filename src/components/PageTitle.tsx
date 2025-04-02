import React, { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

const PageTitle = ({ 
  title, 
  description, 
  icon,
  className = ''
}: PageTitleProps) => {
  return (
    <div className={`mb-6 space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <div className="text-primary">{icon}</div>}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {description && (
        <p className="text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageTitle; 