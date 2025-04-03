import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, Download, Share2, ArrowRight, Mail } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { addDays, format, subMonths } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Component interfaces
interface MoodReportGeneratorProps {
  userId?: string;
  onReportGenerated?: (reportUrl: string) => void;
}

// Date range types
type DateRange = {
  from: Date;
  to: Date;
};

export default function MoodReportGenerator({ userId, onReportGenerated }: MoodReportGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const activeUserId = userId || user?.id;
  
  // Refs for focus management
  const titleInputRef = useRef<HTMLInputElement>(null);
  const generateButtonRef = useRef<HTMLButtonElement>(null);
  const providerEmailRef = useRef<HTMLInputElement>(null);
  
  // Report configuration
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportTitle, setReportTitle] = useState("Mood and Wellness Report");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  
  // Report sections to include
  const [includeMoodData, setIncludeMoodData] = useState(true);
  const [includeCorrelations, setIncludeCorrelations] = useState(true);
  const [includeSleepData, setIncludeSleepData] = useState(true);
  const [includeActivityData, setIncludeActivityData] = useState(true);
  const [includeJournalEntries, setIncludeJournalEntries] = useState(false);
  const [includeTherapyNotes, setIncludeTherapyNotes] = useState(false);
  
  // Provider info
  const [providerEmail, setProviderEmail] = useState("");
  const [includeProviderInfo, setIncludeProviderInfo] = useState(false);
  const [generatePDF, setGeneratePDF] = useState(true);
  
  // Handle provider info toggle
  const handleProviderInfoToggle = (checked: boolean) => {
    setIncludeProviderInfo(checked);
    if (checked && providerEmailRef.current) {
      // Focus the email input when provider info is enabled
      setTimeout(() => {
        providerEmailRef.current?.focus();
      }, 0);
    }
  };
  
  // Generate the report
  const generateReport = async () => {
    if (!activeUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate reports.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Define the report configuration
      const reportConfig = {
        userId: activeUserId,
        title: reportTitle,
        dateRange: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString()
        },
        sections: {
          moodData: includeMoodData,
          correlations: includeCorrelations,
          sleepData: includeSleepData,
          activityData: includeActivityData,
          journalEntries: includeJournalEntries,
          therapyNotes: includeTherapyNotes
        },
        format: generatePDF ? 'pdf' : 'csv',
        providerEmail: includeProviderInfo ? providerEmail : null
      };
      
      // Call the Supabase Edge Function to generate the report
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-mood-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(reportConfig)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }
      
      const { reportUrl, message } = await response.json();
      
      // Notify the user of success
      toast({
        title: "Report Generated",
        description: message || "Your report has been successfully generated."
      });
      
      // If provider email is set, notify about sending
      if (includeProviderInfo && providerEmail) {
        toast({
          title: "Report Shared",
          description: `A copy of the report has been sent to ${providerEmail}.`
        });
      }
      
      // Trigger download for the user
      if (reportUrl) {
        // Create download link and simulate click
        const a = document.createElement('a');
        a.href = reportUrl;
        a.download = `${reportTitle.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.${generatePDF ? 'pdf' : 'csv'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        if (onReportGenerated) {
          onReportGenerated(reportUrl);
        }
      }
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // When a real API doesn't exist, simulate report generation
  const simulateReportGeneration = () => {
    setIsGenerating(true);
    
    // Create a simple CSV report from fake data
    setTimeout(() => {
      const header = "Date,Mood,Sleep Hours,Exercise Minutes,Notes\n";
      const rows = [
        `${format(new Date(), 'yyyy-MM-dd')},happy,7.5,30,"Felt great today."`,
        `${format(addDays(new Date(), -1), 'yyyy-MM-dd')},neutral,6,15,"Average day."`,
        `${format(addDays(new Date(), -2), 'yyyy-MM-dd')},anxious,5,0,"Worried about work."`
      ].join("\n");
      
      const csvContent = `${header}${rows}`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      // Create download link and simulate click
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (onReportGenerated) {
        onReportGenerated(url);
      }
      
      toast({
        title: "Demo Report Generated",
        description: "A sample report has been generated. In a production environment, this would contain your actual data."
      });
      
      setIsGenerating(false);
    }, 2000);
  };

  // Reset form to default values
  const resetForm = () => {
    setReportTitle("Mood and Wellness Report");
    setDateRange({
      from: subMonths(new Date(), 1),
      to: new Date()
    });
    setIncludeMoodData(true);
    setIncludeCorrelations(true);
    setIncludeSleepData(true);
    setIncludeActivityData(true);
    setIncludeJournalEntries(false);
    setIncludeTherapyNotes(false);
    setIncludeProviderInfo(false);
    setProviderEmail("");
    setGeneratePDF(true);
    
    // Focus the title input after reset
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
          Healthcare Provider Report
        </CardTitle>
        <CardDescription>
          Generate a comprehensive wellness report for yourself or to share with your healthcare provider
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4" role="form" aria-label="Report configuration form">
          <div className="space-y-2">
            <Label htmlFor="report-title">Report Title</Label>
            <Input 
              ref={titleInputRef}
              id="report-title"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Enter a title for your report"
              aria-required="true"
            />
          </div>
          
          <div className="space-y-2">
            <Label id="date-range-label">Date Range</Label>
            <DatePickerWithRange 
              date={dateRange} 
              setDate={setDateRange} 
              aria-labelledby="date-range-label"
            />
          </div>
        </div>
        
        <Separator aria-hidden="true" />
        
        <div>
          <h3 className="text-lg font-medium mb-4" id="sections-heading">Include in Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-labelledby="sections-heading">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-mood" 
                checked={includeMoodData} 
                onCheckedChange={(checked) => setIncludeMoodData(checked as boolean)} 
                aria-label="Include mood data in report"
              />
              <Label htmlFor="include-mood">Mood Data</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-correlations" 
                checked={includeCorrelations} 
                onCheckedChange={(checked) => setIncludeCorrelations(checked as boolean)} 
                aria-label="Include correlations and insights in report"
              />
              <Label htmlFor="include-correlations">Correlations & Insights</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-sleep" 
                checked={includeSleepData} 
                onCheckedChange={(checked) => setIncludeSleepData(checked as boolean)} 
                aria-label="Include sleep data in report"
              />
              <Label htmlFor="include-sleep">Sleep Data</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-activity" 
                checked={includeActivityData} 
                onCheckedChange={(checked) => setIncludeActivityData(checked as boolean)} 
                aria-label="Include activity data in report"
              />
              <Label htmlFor="include-activity">Activity Data</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-journal" 
                checked={includeJournalEntries} 
                onCheckedChange={(checked) => setIncludeJournalEntries(checked as boolean)} 
                aria-label="Include journal entries in report"
              />
              <Label htmlFor="include-journal">Journal Entries</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-therapy" 
                checked={includeTherapyNotes} 
                onCheckedChange={(checked) => setIncludeTherapyNotes(checked as boolean)} 
                aria-label="Include therapy notes in report"
              />
              <Label htmlFor="include-therapy">Therapy Notes</Label>
            </div>
          </div>
        </div>
        
        <Separator aria-hidden="true" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium" id="provider-heading">Share with Provider</h3>
            <div className="flex items-center space-x-2">
              <Switch 
                id="share-provider" 
                checked={includeProviderInfo}
                onCheckedChange={handleProviderInfoToggle}
                aria-labelledby="provider-heading"
              />
              <Label htmlFor="share-provider">Send to Provider</Label>
            </div>
          </div>
          
          {includeProviderInfo && (
            <div className="space-y-2">
              <Label htmlFor="provider-email">Provider Email</Label>
              <div className="flex gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Input 
                  ref={providerEmailRef}
                  id="provider-email"
                  value={providerEmail}
                  onChange={(e) => setProviderEmail(e.target.value)}
                  type="email"
                  placeholder="healthcare.provider@example.com"
                  className="flex-1"
                  aria-required={includeProviderInfo}
                  aria-invalid={includeProviderInfo && providerEmail === ""}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your provider will receive a secure link to download your report.
              </p>
            </div>
          )}
        </div>
        
        <Separator aria-hidden="true" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pdf-format" id="format-label">Generate PDF Report</Label>
            <Switch 
              id="pdf-format" 
              checked={generatePDF}
              onCheckedChange={setGeneratePDF}
              aria-labelledby="format-label"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {generatePDF 
              ? "PDF reports include visualizations and are formatted for healthcare providers." 
              : "CSV reports contain raw data that can be imported into other applications."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground" aria-live="polite">
          {dateRange.from && dateRange.to && (
            <span>
              Reporting data from {format(dateRange.from, 'MMM d, yyyy')} to {format(dateRange.to, 'MMM d, yyyy')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={resetForm}
            aria-label="Reset form to default values"
          >
            Reset
          </Button>
          <Button 
            ref={generateButtonRef}
            // In development, use the simulation function
            onClick={process.env.NODE_ENV === 'development' ? simulateReportGeneration : generateReport}
            disabled={isGenerating}
            className="flex items-center gap-2"
            aria-busy={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Report'} 
            {!isGenerating && <Download className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 