import { useTherapyData } from '@/contexts/TherapyDataProvider';
import { StatusBar } from '@/components/ui/StatusBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUsingFallbackData } = useTherapyData();
  
  return (
    <>
      <StatusBar isOffline={isUsingFallbackData} />
    </>
  );
} 