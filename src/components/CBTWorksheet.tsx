import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Define interfaces for worksheet data
export interface ThoughtRecord {
  id: string;
  date: string;
  situation: string;
  automaticThoughts: string;
  emotions: Array<{
    name: string;
    intensity: number;
  }>;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  newEmotions: Array<{
    name: string;
    intensity: number;
  }>;
  reflection: string;
}

export interface BehavioralExperiment {
  id: string;
  date: string;
  prediction: string;
  predictionBelief: number;
  experiment: string;
  result: string;
  learnings: string;
  newBelief: number;
}

interface CBTWorksheetProps {
  userId: string;
  className?: string;
  onSave?: (data: ThoughtRecord | BehavioralExperiment) => void;
}

export const CBTWorksheet: React.FC<CBTWorksheetProps> = ({
  userId,
  className,
  onSave
}) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('thought-record');
  
  // States for dialogs
  const [thoughtRecordOpen, setThoughtRecordOpen] = useState(false);
  const [experimentOpen, setExperimentOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  // Load saved records from local storage
  const [thoughtRecords, setThoughtRecords] = useLocalStorage<ThoughtRecord[]>(
    `thought-records-${userId}`,
    []
  );
  
  const [behavioralExperiments, setBehavioralExperiments] = useLocalStorage<BehavioralExperiment[]>(
    `behavioral-experiments-${userId}`,
    []
  );
  
  // State for form data
  const [thoughtRecord, setThoughtRecord] = useState<Partial<ThoughtRecord>>({
    id: `tr-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    emotions: [{ name: '', intensity: 50 }],
    newEmotions: [{ name: '', intensity: 50 }]
  });
  
  const [experiment, setExperiment] = useState<Partial<BehavioralExperiment>>({
    id: `be-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    predictionBelief: 80,
    newBelief: 50
  });
  
  // Handle form changes
  const handleThoughtRecordChange = (field: keyof ThoughtRecord, value: any) => {
    setThoughtRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleExperimentChange = (field: keyof BehavioralExperiment, value: any) => {
    setExperiment(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle emotion changes
  const handleEmotionChange = (index: number, field: 'name' | 'intensity', value: string | number) => {
    setThoughtRecord(prev => {
      const emotions = [...(prev.emotions || [])];
      emotions[index] = { 
        ...emotions[index], 
        [field]: value 
      };
      return { ...prev, emotions };
    });
  };
  
  const handleNewEmotionChange = (index: number, field: 'name' | 'intensity', value: string | number) => {
    setThoughtRecord(prev => {
      const newEmotions = [...(prev.newEmotions || [])];
      newEmotions[index] = { 
        ...newEmotions[index], 
        [field]: value 
      };
      return { ...prev, newEmotions };
    });
  };
  
  // Add emotion fields
  const addEmotion = (type: 'emotions' | 'newEmotions') => {
    setThoughtRecord(prev => {
      const emotions = [...(prev[type] || []), { name: '', intensity: 50 }];
      return { ...prev, [type]: emotions };
    });
  };
  
  // Remove emotion fields
  const removeEmotion = (type: 'emotions' | 'newEmotions', index: number) => {
    setThoughtRecord(prev => {
      const emotions = [...(prev[type] || [])];
      if (emotions.length > 1) {
        emotions.splice(index, 1);
        return { ...prev, [type]: emotions };
      }
      return prev;
    });
  };
  
  // Save thought record
  const saveThoughtRecord = () => {
    if (
      !thoughtRecord.situation || 
      !thoughtRecord.automaticThoughts || 
      !(thoughtRecord.emotions && thoughtRecord.emotions[0]?.name)
    ) {
      // Validation failed
      return;
    }
    
    const newRecord: ThoughtRecord = {
      id: thoughtRecord.id || `tr-${Date.now()}`,
      date: thoughtRecord.date || new Date().toISOString().split('T')[0],
      situation: thoughtRecord.situation || '',
      automaticThoughts: thoughtRecord.automaticThoughts || '',
      emotions: thoughtRecord.emotions || [],
      evidenceFor: thoughtRecord.evidenceFor || '',
      evidenceAgainst: thoughtRecord.evidenceAgainst || '',
      alternativeThought: thoughtRecord.alternativeThought || '',
      newEmotions: thoughtRecord.newEmotions || [],
      reflection: thoughtRecord.reflection || ''
    };
    
    // Save to local storage
    setThoughtRecords(prev => [newRecord, ...prev]);
    
    // Call external save handler if provided
    if (onSave) {
      onSave(newRecord);
    }
    
    // Reset form and close dialog
    setThoughtRecord({
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      emotions: [{ name: '', intensity: 50 }],
      newEmotions: [{ name: '', intensity: 50 }]
    });
    
    setThoughtRecordOpen(false);
  };
  
  // Save behavioral experiment
  const saveExperiment = () => {
    if (
      !experiment.prediction || 
      !experiment.experiment
    ) {
      // Validation failed
      return;
    }
    
    const newExperiment: BehavioralExperiment = {
      id: experiment.id || `be-${Date.now()}`,
      date: experiment.date || new Date().toISOString().split('T')[0],
      prediction: experiment.prediction || '',
      predictionBelief: experiment.predictionBelief || 80,
      experiment: experiment.experiment || '',
      result: experiment.result || '',
      learnings: experiment.learnings || '',
      newBelief: experiment.newBelief || 50
    };
    
    // Save to local storage
    setBehavioralExperiments(prev => [newExperiment, ...prev]);
    
    // Call external save handler if provided
    if (onSave) {
      onSave(newExperiment);
    }
    
    // Reset form and close dialog
    setExperiment({
      id: `be-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      predictionBelief: 80,
      newBelief: 50
    });
    
    setExperimentOpen(false);
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          CBT Worksheets
        </CardTitle>
        <CardDescription>
          Evidence-based tools to challenge negative thoughts and behaviors
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="thought-record" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="thought-record">Thought Records</TabsTrigger>
            <TabsTrigger value="behavioral-experiment">Behavioral Experiments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="thought-record" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Thought records help you identify negative thinking patterns and develop more balanced perspectives.
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setThoughtRecordOpen(true)}
                className="flex-1"
              >
                Create New Thought Record
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveTab('thought-record');
                  setHistoryDialogOpen(true);
                }}
                className="flex-1"
                disabled={thoughtRecords.length === 0}
              >
                View Past Records ({thoughtRecords.length})
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="behavioral-experiment" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Behavioral experiments help you test the accuracy of your predictions and beliefs through real-world actions.
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setExperimentOpen(true)}
                className="flex-1"
              >
                Create New Experiment
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveTab('behavioral-experiment');
                  setHistoryDialogOpen(true);
                }}
                className="flex-1"
                disabled={behavioralExperiments.length === 0}
              >
                View Past Experiments ({behavioralExperiments.length})
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="link" size="sm" className="px-0 text-xs">
          Learn more about CBT techniques
        </Button>
      </CardFooter>
      
      {/* Thought Record Dialog */}
      <Dialog open={thoughtRecordOpen} onOpenChange={setThoughtRecordOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thought Record</DialogTitle>
            <DialogDescription>
              Identify, analyze, and reframe negative thoughts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tr-date">Date</Label>
              <Input
                id="tr-date"
                type="date"
                value={thoughtRecord.date}
                onChange={(e) => handleThoughtRecordChange('date', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tr-situation">Situation</Label>
              <Textarea
                id="tr-situation"
                placeholder="What happened? When and where did it occur? Who was involved?"
                value={thoughtRecord.situation || ''}
                onChange={(e) => handleThoughtRecordChange('situation', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tr-thoughts">Automatic Thoughts</Label>
              <Textarea
                id="tr-thoughts"
                placeholder="What went through your mind? What thoughts or images did you have?"
                value={thoughtRecord.automaticThoughts || ''}
                onChange={(e) => handleThoughtRecordChange('automaticThoughts', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Emotions & Intensity</Label>
              {thoughtRecord.emotions?.map((emotion, index) => (
                <div key={`emotion-${index}`} className="flex gap-2 items-center">
                  <Input
                    placeholder="Emotion (e.g., anxiety, sadness)"
                    value={emotion.name}
                    onChange={(e) => handleEmotionChange(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex gap-2 items-center w-[180px]">
                    <Slider
                      value={[emotion.intensity]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => handleEmotionChange(index, 'intensity', value[0])}
                    />
                    <span className="w-8 text-sm">{emotion.intensity}%</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmotion('emotions', index)}
                    disabled={thoughtRecord.emotions?.length === 1}
                  >
                    -
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addEmotion('emotions')}
                className="w-full mt-1"
              >
                + Add another emotion
              </Button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tr-evidence-for">Evidence Supporting Thought</Label>
              <Textarea
                id="tr-evidence-for"
                placeholder="What facts support this thought being true?"
                value={thoughtRecord.evidenceFor || ''}
                onChange={(e) => handleThoughtRecordChange('evidenceFor', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tr-evidence-against">Evidence Against Thought</Label>
              <Textarea
                id="tr-evidence-against"
                placeholder="What facts suggest this thought might not be entirely true or accurate?"
                value={thoughtRecord.evidenceAgainst || ''}
                onChange={(e) => handleThoughtRecordChange('evidenceAgainst', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tr-alternative">Alternative or Balanced Thought</Label>
              <Textarea
                id="tr-alternative"
                placeholder="Based on the evidence, what's a more balanced or helpful way to think about the situation?"
                value={thoughtRecord.alternativeThought || ''}
                onChange={(e) => handleThoughtRecordChange('alternativeThought', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>New Emotions & Intensity</Label>
              {thoughtRecord.newEmotions?.map((emotion, index) => (
                <div key={`new-emotion-${index}`} className="flex gap-2 items-center">
                  <Input
                    placeholder="Emotion (e.g., relief, calm)"
                    value={emotion.name}
                    onChange={(e) => handleNewEmotionChange(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex gap-2 items-center w-[180px]">
                    <Slider
                      value={[emotion.intensity]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => handleNewEmotionChange(index, 'intensity', value[0])}
                    />
                    <span className="w-8 text-sm">{emotion.intensity}%</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmotion('newEmotions', index)}
                    disabled={thoughtRecord.newEmotions?.length === 1}
                  >
                    -
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addEmotion('newEmotions')}
                className="w-full mt-1"
              >
                + Add another emotion
              </Button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tr-reflection">Reflection</Label>
              <Textarea
                id="tr-reflection"
                placeholder="What did you learn from this exercise? How might you apply this learning in the future?"
                value={thoughtRecord.reflection || ''}
                onChange={(e) => handleThoughtRecordChange('reflection', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setThoughtRecordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveThoughtRecord}>
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Behavioral Experiment Dialog */}
      <Dialog open={experimentOpen} onOpenChange={setExperimentOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Behavioral Experiment</DialogTitle>
            <DialogDescription>
              Test your predictions through real-world actions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="be-date">Date</Label>
              <Input
                id="be-date"
                type="date"
                value={experiment.date}
                onChange={(e) => handleExperimentChange('date', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="be-prediction">Prediction</Label>
              <Textarea
                id="be-prediction"
                placeholder="What do you predict will happen? What are you afraid of?"
                value={experiment.prediction || ''}
                onChange={(e) => handleExperimentChange('prediction', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>
                How strongly do you believe this prediction? ({experiment.predictionBelief}%)
              </Label>
              <Slider
                value={[experiment.predictionBelief || 80]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleExperimentChange('predictionBelief', value[0])}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="be-experiment">Experiment Plan</Label>
              <Textarea
                id="be-experiment"
                placeholder="What will you do to test this prediction? Be specific about what, when, where, and how."
                value={experiment.experiment || ''}
                onChange={(e) => handleExperimentChange('experiment', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="be-result">Result</Label>
              <Textarea
                id="be-result"
                placeholder="What actually happened? What did you observe?"
                value={experiment.result || ''}
                onChange={(e) => handleExperimentChange('result', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="be-learnings">What I Learned</Label>
              <Textarea
                id="be-learnings"
                placeholder="What did this experiment teach you? How does the evidence compare to your prediction?"
                value={experiment.learnings || ''}
                onChange={(e) => handleExperimentChange('learnings', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>
                How strongly do you believe your original prediction now? ({experiment.newBelief}%)
              </Label>
              <Slider
                value={[experiment.newBelief || 50]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleExperimentChange('newBelief', value[0])}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExperimentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveExperiment}>
              Save Experiment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'thought-record' ? 'Thought Record History' : 'Behavioral Experiment History'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'thought-record' 
                ? 'Review your past thought records' 
                : 'Review your past behavioral experiments'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            {activeTab === 'thought-record' ? (
              <div className="space-y-4">
                {thoughtRecords.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No thought records yet. Create your first one!
                  </p>
                ) : (
                  thoughtRecords.map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {new Date(record.date).toLocaleDateString()}
                          </h4>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium">Situation:</h5>
                          <p className="text-sm">{record.situation}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium">Thoughts:</h5>
                          <p className="text-sm">{record.automaticThoughts}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium">Emotions:</h5>
                          <div className="flex flex-wrap gap-2">
                            {record.emotions.map((emotion, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-secondary rounded-full">
                                {emotion.name}: {emotion.intensity}%
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {record.alternativeThought && (
                          <div>
                            <h5 className="text-sm font-medium">Alternative Thought:</h5>
                            <p className="text-sm">{record.alternativeThought}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {behavioralExperiments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No behavioral experiments yet. Create your first one!
                  </p>
                ) : (
                  behavioralExperiments.map((exp) => (
                    <Card key={exp.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {new Date(exp.date).toLocaleDateString()}
                          </h4>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium">Prediction:</h5>
                          <p className="text-sm">{exp.prediction}</p>
                          <p className="text-xs text-muted-foreground">
                            Initial belief: {exp.predictionBelief}%
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium">Experiment:</h5>
                          <p className="text-sm">{exp.experiment}</p>
                        </div>
                        
                        {exp.result && (
                          <div>
                            <h5 className="text-sm font-medium">Result:</h5>
                            <p className="text-sm">{exp.result}</p>
                          </div>
                        )}
                        
                        {exp.newBelief !== undefined && (
                          <div>
                            <h5 className="text-sm font-medium">Belief After Experiment:</h5>
                            <p className="text-sm">{exp.newBelief}%</p>
                            <p className="text-xs text-muted-foreground">
                              {exp.newBelief < exp.predictionBelief ? 'Decreased' : 'Increased'} by {Math.abs(exp.newBelief - exp.predictionBelief)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter>
            <Button onClick={() => setHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}; 