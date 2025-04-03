import { useTherapyData } from '@/contexts/TherapyDataProvider';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';

export default function Dashboard() {
  const { isUsingFallbackData } = useTherapyData();
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <OfflineIndicator isUsingFallback={isUsingFallbackData} />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ... existing code ... */}
      </div>
    </div>
  );
} 