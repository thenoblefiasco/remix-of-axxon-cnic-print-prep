import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Printer, AlertCircle } from 'lucide-react';

interface PrintGuidanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
}

const PrintGuidanceDialog = ({ open, onOpenChange, onProceed }: PrintGuidanceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Printer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Duplex Printing Guide</DialogTitle>
              <DialogDescription>Follow these steps for successful printing</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This guide helps you print both sides of CNICs correctly
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                1
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Print Front Sides First</p>
                <p className="text-muted-foreground">
                  Select "Print" and ensure your printer is set to actual size (100% scale)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                2
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Wait for Print to Complete</p>
                <p className="text-muted-foreground">
                  Let all pages finish printing before proceeding to the next step
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                3
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Flip Paper Stack</p>
                <p className="text-muted-foreground">
                  Take printed pages and flip them over, maintaining the same orientation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                4
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Print Back Sides</p>
                <p className="text-muted-foreground">
                  Re-insert paper and print again to add back sides
                </p>
              </div>
            </div>
          </div>

          <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Test with a single sheet first to ensure correct alignment
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onProceed}>
            <Printer className="h-4 w-4 mr-2" />
            Start Printing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintGuidanceDialog;
