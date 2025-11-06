import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  RotateCw, 
  Trash2, 
  FlipHorizontal, 
  Edit, 
  Upload,
  Undo2,
  Redo2,
  ZoomIn,
  Wand2,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useImageHistory } from '@/hooks/useImageHistory';
import { autoPairImages, createImageFromFile } from '@/lib/imageUtils';
import ImageZoomDialog from '@/components/ImageZoomDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExtractedImage {
  id: string;
  name: string;
  url: string;
  type: 'front' | 'back' | 'unknown';
  rotation: number;
  flipped: boolean;
}

interface SortableImageProps {
  image: ExtractedImage;
  onRotate: (id: string) => void;
  onFlip: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (image: ExtractedImage) => void;
  onZoom: (image: ExtractedImage) => void;
  onReplace: (id: string) => void;
}

const SortableImage = ({ 
  image, 
  onRotate, 
  onFlip, 
  onDelete, 
  onEdit, 
  onZoom,
  onReplace,
}: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="overflow-hidden border-border hover:shadow-md transition-shadow">
        <div 
          className="aspect-[85.6/54] bg-muted relative cursor-move"
          {...listeners}
        >
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover"
            style={{
              transform: `rotate(${image.rotation}deg) scaleX(${image.flipped ? -1 : 1})`,
              transition: 'transform 0.3s ease',
            }}
          />
          {image.type !== 'unknown' && (
            <Badge 
              className="absolute top-2 left-2"
              variant={image.type === 'front' ? 'default' : 'secondary'}
            >
              {image.type}
            </Badge>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onZoom(image);
            }}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
        <div className="p-2 flex gap-1 justify-center bg-card flex-wrap">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onRotate(image.id);
            }}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onFlip(image.id);
            }}
          >
            <FlipHorizontal className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(image);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onReplace(image.id);
            }}
          >
            <Upload className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image.id);
            }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

const LayoutPage = () => {
  const { state: images, setState: setImages, undo, redo, canUndo, canRedo } = useImageHistory<ExtractedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ExtractedImage | null>(null);
  const [zoomImage, setZoomImage] = useState<ExtractedImage | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const stored = sessionStorage.getItem('extractedImages');
    if (stored) {
      const parsed = JSON.parse(stored);
      setImages(parsed.map((img: ExtractedImage) => ({ 
        ...img, 
        rotation: img.rotation || 0, 
        flipped: img.flipped || false 
      })));
    }
  }, [setImages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // Save to session storage whenever images change
  useEffect(() => {
    if (images.length > 0) {
      sessionStorage.setItem('extractedImages', JSON.stringify(images));
    }
  }, [images]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      setImages(arrayMove(images, oldIndex, newIndex));
      toast({
        title: 'Images Reordered',
        description: 'Layout updated successfully',
      });
    }
  };

  const rotateImage = useCallback((id: string) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
    ));
  }, [images, setImages]);

  const flipImage = useCallback((id: string) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, flipped: !img.flipped } : img
    ));
  }, [images, setImages]);

  const deleteImage = useCallback((id: string) => {
    setImages(images.filter(img => img.id !== id));
    toast({
      title: 'Image Removed',
      description: 'Image has been deleted from the layout',
    });
  }, [images, setImages, toast]);

  const markAs = (id: string, type: 'front' | 'back') => {
    setImages(images.map(img => 
      img.id === id ? { ...img, type } : img
    ));
    setSelectedImage(null);
    toast({
      title: 'Image Marked',
      description: `Image marked as ${type}`,
    });
  };

  const handleAutoPair = () => {
    const paired = autoPairImages(images);
    setImages(paired);
    toast({
      title: 'Auto-Pair Complete',
      description: 'Images have been automatically paired and sorted',
    });
  };

  const handleRotateAll = () => {
    setImages(images.map(img => ({ ...img, rotation: (img.rotation + 90) % 360 })));
    toast({
      title: 'All Rotated',
      description: 'All images rotated 90° clockwise',
    });
  };

  const handleFlipAll = () => {
    setImages(images.map(img => ({ ...img, flipped: !img.flipped })));
    toast({
      title: 'All Flipped',
      description: 'All images flipped horizontally',
    });
  };

  const handleResetAll = () => {
    setImages(images.map(img => ({ ...img, rotation: 0, flipped: false })));
    toast({
      title: 'All Reset',
      description: 'All transformations reset',
    });
  };

  const handleClearAll = () => {
    setImages([]);
    sessionStorage.removeItem('extractedImages');
    setShowClearDialog(false);
    toast({
      title: 'Layout Cleared',
      description: 'All images removed from layout',
    });
  };

  const handleReplaceImage = async (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const newImage = await createImageFromFile(file, id);
      const oldImage = images.find(img => img.id === id);
      
      if (oldImage) {
        newImage.type = oldImage.type;
        newImage.rotation = oldImage.rotation;
        newImage.flipped = oldImage.flipped;
      }

      setImages(images.map(img => img.id === id ? newImage : img));
      toast({
        title: 'Image Replaced',
        description: 'Image has been updated',
      });
    };

    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Layout Adjustments</h2>
          <p className="text-muted-foreground mt-2">
            Arrange your CNIC images - drag to reorder
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4 mr-2" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4 mr-2" />
            Redo
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <Card className="p-4 border-border">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoPair}>
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-Pair
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotateAll}>
              <RotateCw className="h-4 w-4 mr-2" />
              Rotate All
            </Button>
            <Button variant="outline" size="sm" onClick={handleFlipAll}>
              <FlipHorizontal className="h-4 w-4 mr-2" />
              Flip All
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetAll}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowClearDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Layers className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              {images.length} images loaded
            </div>
          </div>
        </Card>
      )}

      {images.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border">
          <p className="text-muted-foreground">
            No images loaded. Please upload a ZIP file first.
          </p>
          <Button className="mt-4" onClick={() => window.location.href = '/upload'}>
            Upload Images
          </Button>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <SortableImage
                      image={image}
                      onRotate={rotateImage}
                      onFlip={flipImage}
                      onDelete={deleteImage}
                      onEdit={setSelectedImage}
                      onZoom={setZoomImage}
                      onReplace={handleReplaceImage}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Options</DialogTitle>
            <DialogDescription>
              Mark this image as front or back side of CNIC
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-[85.6/54] bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="w-full h-full object-cover"
                  style={{
                    transform: `rotate(${selectedImage.rotation}deg) scaleX(${selectedImage.flipped ? -1 : 1})`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground truncate">{selectedImage.name}</p>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant={selectedImage.type === 'front' ? 'default' : 'outline'}
                  onClick={() => markAs(selectedImage.id, 'front')}
                >
                  Mark as Front
                </Button>
                <Button
                  className="flex-1"
                  variant={selectedImage.type === 'back' ? 'default' : 'outline'}
                  onClick={() => markAs(selectedImage.id, 'back')}
                >
                  Mark as Back
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ImageZoomDialog
        open={!!zoomImage}
        onOpenChange={() => setZoomImage(null)}
        imageUrl={zoomImage?.url || ''}
        imageName={zoomImage?.name || ''}
        rotation={zoomImage?.rotation}
        flipped={zoomImage?.flipped}
      />

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Images?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all images from the layout. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Clear All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LayoutPage;
