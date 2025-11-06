import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useState } from 'react';

interface ImageZoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  imageName: string;
  rotation?: number;
  flipped?: boolean;
}

const ImageZoomDialog = ({ 
  open, 
  onOpenChange, 
  imageUrl, 
  imageName,
  rotation = 0,
  flipped = false,
}: ImageZoomDialogProps) => {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleReset = () => setZoom(100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{imageName}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {zoom}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="overflow-auto max-h-[60vh] bg-muted rounded-lg p-4 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={imageName}
            className="max-w-full h-auto"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`,
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageZoomDialog;
