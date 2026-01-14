import { CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateTask?: () => void;
}

export function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="status" aria-label="No tasks available">
      <div className="rounded-full bg-muted p-6 mb-4">
        <CheckSquare className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Get started by creating your first task. Stay organized and track your weekly progress.
      </p>
      {onCreateTask && (
        <Button onClick={onCreateTask} size="lg">
          <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
          Create Your First Task
        </Button>
      )}
    </div>
  );
}
