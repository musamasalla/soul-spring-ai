
import { useState } from "react";
import { Loader2, PlusCircle, Calendar, Search, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  created_at: string;
  tags?: string[];
}

const JournalPage = () => {
  const { user, isPremium, checkUsageLimits } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'First Meditation Session',
      content: 'Today I tried meditation for the first time. It was really challenging to calm my mind, but after about 5 minutes I started to feel more relaxed.',
      mood: 'calm',
      created_at: '2023-10-15T10:30:00Z',
      tags: ['meditation', 'beginner']
    },
    {
      id: '2',
      title: 'Anxiety Management',
      content: 'Had a stressful day at work, but used the breathing techniques I learned in the app. They really helped calm me down when I felt overwhelmed.',
      mood: 'anxious',
      created_at: '2023-10-12T18:45:00Z',
      tags: ['anxiety', 'breathing', 'work']
    }
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: ''
  });

  const handleCreateEntry = async () => {
    // Check usage limits for non-premium users
    if (!isPremium) {
      const { canUse, remaining } = checkUsageLimits('journal_entries');
      if (!canUse) {
        toast.error("You've reached your journal entries limit. Upgrade to premium for unlimited entries.");
        return;
      }
      if (remaining <= 1) {
        toast.warning(`This is your last available entry. Upgrade to premium for unlimited entries.`);
      }
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newEntryObj: JournalEntry = {
        id: Date.now().toString(),
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        created_at: new Date().toISOString(),
        tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      };
      
      setEntries([newEntryObj, ...entries]);
      setNewEntry({
        title: '',
        content: '',
        mood: 'neutral',
        tags: ''
      });
      setIsCreating(false);
      toast.success("Journal entry created successfully!");
    } catch (error) {
      console.error("Error creating journal entry:", error);
      toast.error("Failed to create journal entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter entries based on search term
  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Journal</h1>
            <p className="text-muted-foreground">Document your thoughts and track your mental well-being</p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)} 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your journal entries..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* New Entry Form */}
        {isCreating && (
          <Card className="mb-6 border border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle>New Journal Entry</CardTitle>
              <CardDescription>Record your thoughts, feelings, and experiences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  placeholder="Give your entry a title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Content</label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind today?"
                  rows={6}
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="mood" className="text-sm font-medium">Mood</label>
                <select
                  id="mood"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
                >
                  <option value="great">Great 😄</option>
                  <option value="good">Good 🙂</option>
                  <option value="neutral">Neutral 😐</option>
                  <option value="low">Low 😔</option>
                  <option value="terrible">Terrible 😢</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">Tags (comma separated)</label>
                <Input
                  id="tags"
                  placeholder="meditation, anxiety, sleep..."
                  value={newEntry.tags}
                  onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button
                onClick={handleCreateEntry}
                disabled={!newEntry.title || !newEntry.content || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Entry"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Journal Entries */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No journal entries found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try a different search term' : 'Start journaling to track your well-being journey'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{entry.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(entry.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                  {entry.mood && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {entry.mood}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{entry.content}</p>
                </CardContent>
                {entry.tags && entry.tags.length > 0 && (
                  <CardFooter className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>
        
        {!isPremium && (
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground">Get unlimited journal entries and advanced analytics</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/premium'} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Upgrade
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default JournalPage;
