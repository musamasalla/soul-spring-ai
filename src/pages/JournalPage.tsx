import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Calendar, Search, FileText, Trash2, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry, NewJournalEntry } from "@/types/journal";

const JournalPage = () => {
  const { user, isPremium, checkUsageLimits } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: ''
  });

  // Fetch journal entries on component mount
  useEffect(() => {
    if (user) {
      fetchJournalEntries();
    }
  }, [user]);

  // Fetch journal entries from Supabase
  const fetchJournalEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setEntries(data as JournalEntry[]);
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast.error("Failed to load journal entries. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
    
    setIsSubmitting(true);
    try {
      // Parse tags into an array
      const tagsArray = newEntry.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      // Create new entry object with required fields
      const entryData = {
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        tags: tagsArray.length > 0 ? tagsArray : null
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entryData)
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Add the new entry to the local state
        setEntries([data[0] as JournalEntry, ...entries]);
        
        // Reset the form
        setNewEntry({
          title: '',
          content: '',
          mood: 'neutral',
          tags: ''
        });
        setIsCreating(false);
        toast.success("Journal entry created successfully!");
      }
    } catch (error) {
      console.error("Error creating journal entry:", error);
      toast.error("Failed to create journal entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle favorite status of an entry
  const handleToggleFavorite = async (entryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ is_favorite: !currentStatus })
        .eq('id', entryId);
      
      if (error) {
        throw error;
      }
      
      // Update the local state
      setEntries(entries.map(entry => 
        entry.id === entryId 
          ? { ...entry, is_favorite: !currentStatus } 
          : entry
      ));
      
      toast.success(currentStatus 
        ? "Removed from favorites" 
        : "Added to favorites");
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      toast.error("Failed to update entry. Please try again.");
    }
  };

  // Delete a journal entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) {
        throw error;
      }
      
      // Remove the entry from the local state
      setEntries(entries.filter(entry => entry.id !== entryId));
      toast.success("Journal entry deleted successfully");
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast.error("Failed to delete entry. Please try again.");
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
                disabled={!newEntry.title || !newEntry.content || isSubmitting}
              >
                {isSubmitting ? (
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEntries.length === 0 ? (
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
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleToggleFavorite(entry.id, entry.is_favorite || false)}
                      >
                        <Heart className={`h-4 w-4 ${entry.is_favorite ? 'fill-current text-red-500' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    {entry.mood && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {entry.mood}
                      </Badge>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(entry.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
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
