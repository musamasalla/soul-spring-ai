import { EnhancedAIChat } from '@/components/EnhancedAIChat';
import { TherapySessionManager } from '@/components/TherapySessionManager';
import { TherapyGoalsManager } from '@/components/TherapyGoalsManager';
import { TherapeuticInterventions } from '@/components/TherapeuticInterventions';
import { CBTWorksheet } from '@/components/CBTWorksheet';

export default function TherapyAIPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-60px)] overflow-hidden">
      <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
        <EnhancedAIChat 
          sessionId={activeSession?.id}
          currentStage={activeSession?.metadata?.stage as any}
          onStageUpdate={handleStageUpdate}
          sessionTopics={activeSession?.metadata?.topic as string[]}
          completionPercentage={activeSession?.metadata?.completion_percentage as number}
          onCompletionUpdate={handleCompletionUpdate}
          onNewMessage={handleNewMessage}
          enableTherapeuticInterventions={true}
        />
      </div>
      
      <div className="hidden lg:flex flex-col h-full overflow-hidden">
        <div className="h-full overflow-y-auto pb-6 px-2">
          <TherapySessionManager 
            userId={user?.id || ''}
            activeSessionId={activeSession?.id}
            setActiveSessionId={setActiveSessionId}
            onNewSession={handleCreateNewSession}
          />
          
          {activeSession && (
            <TherapyGoalsManager 
              userId={user?.id || ''}
              sessionId={activeSession?.id}
              className="mt-4"
            />
          )}
          
          {user && (
            <CBTWorksheet 
              userId={user.id}
              className="mt-4"
            />
          )}
          
          {user && activeSession && (
            <TherapeuticInterventions
              userId={user.id}
              className="mt-4"
            />
          )}
        </div>
      </div>
    </div>
  );
} 