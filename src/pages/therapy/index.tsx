import { useTherapyData } from '@/contexts/TherapyDataProvider';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';

export default function TherapyDashboard() {
  const { isUsingFallbackData } = useTherapyData();
  
  return (
    <div className="container mx-auto py-6 px-4">
      <OfflineIndicator isUsingFallback={isUsingFallbackData} />
      
      <div className="flex flex-col space-y-4">
        {/* ... existing code ... */}
      </div>
    </div>
  );
} 