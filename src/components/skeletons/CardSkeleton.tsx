import { cn } from "@/lib/utils";

type CardSkeletonProps = {
  className?: string;
  imageHeight?: number;
  rows?: number;
};

export function CardSkeleton({
  className = "",
  imageHeight = 0,
  rows = 3,
}: CardSkeletonProps) {
  return (
    <div className={cn("border rounded-lg p-4 bg-card", className)}>
      {imageHeight > 0 && (
        <div 
          className="w-full bg-secondary/20 rounded-md animate-pulse mb-4" 
          style={{ height: `${imageHeight}px` }} 
        />
      )}
      <div className="h-6 w-3/4 bg-secondary/30 rounded-md animate-pulse mb-4" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i}
            className={`h-4 bg-secondary/30 rounded-md animate-pulse`} 
            style={{ 
              width: `${100 - (i * 10)}%`,
              animationDelay: `${i * 100}ms`
            }} 
          />
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-start">
        <div className="h-10 w-10 rounded-full bg-secondary/30 animate-pulse mr-3" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-secondary/30 rounded-md animate-pulse mb-2" />
          <div className="space-y-2">
            <div className="h-4 w-full max-w-md bg-secondary/30 rounded-md animate-pulse" />
            <div className="h-4 w-5/6 max-w-md bg-secondary/30 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex items-start self-end">
        <div className="flex-1">
          <div className="h-4 w-24 bg-secondary/30 rounded-md animate-pulse mb-2 ml-auto" />
          <div className="space-y-2">
            <div className="h-4 w-full max-w-md bg-secondary/30 rounded-md animate-pulse" />
            <div className="h-4 w-5/6 max-w-md bg-secondary/30 rounded-md animate-pulse ml-auto" />
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-secondary/30 animate-pulse ml-3" />
      </div>
    </div>
  );
}

export function MeditationPlayerSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="h-8 w-2/3 bg-secondary/30 rounded-md animate-pulse mb-6" />
      <div className="h-32 w-full bg-secondary/20 rounded-lg animate-pulse mb-6" />
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-16 bg-secondary/30 rounded-md animate-pulse" />
        <div className="h-4 w-16 bg-secondary/30 rounded-md animate-pulse" />
      </div>
      <div className="h-2 w-full bg-secondary/30 rounded-md animate-pulse mb-6" />
      <div className="flex justify-center space-x-4">
        <div className="h-10 w-10 rounded-full bg-secondary/30 animate-pulse" />
        <div className="h-10 w-10 rounded-full bg-secondary/30 animate-pulse" />
        <div className="h-10 w-10 rounded-full bg-secondary/30 animate-pulse" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-4 w-full max-w-7xl mx-auto">
      <div className="h-8 w-2/3 bg-secondary/30 rounded-md animate-pulse mb-4" />
      <div className="h-4 w-1/2 bg-secondary/30 rounded-md animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
} 