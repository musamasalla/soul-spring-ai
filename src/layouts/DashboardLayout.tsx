import { useTherapyData } from '@/contexts/TherapyDataProvider';
import { StatusBar } from '@/components/ui/StatusBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUsingFallbackData } = useTherapyData();
  
  return (
    <div className="flex flex-col min-h-screen">
      <StatusBar isOffline={isUsingFallbackData} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 