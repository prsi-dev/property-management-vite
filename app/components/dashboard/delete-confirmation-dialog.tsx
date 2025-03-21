import { Button } from '~/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background w-full max-w-md rounded-lg shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-destructive flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle size={20} />
            {title}
          </h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground">{message}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
