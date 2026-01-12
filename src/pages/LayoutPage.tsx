import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
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
  GripVertical,
  FlipVertical,
  Copy,
  SunMedium,
  Contrast,
  Printer,
  ChevronLeft,
  ChevronRight,
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
import ImageZoomDialog from '@/components/ImageZoomDialog';
import PrintPreviewDialog from '@/components/PrintPreviewDialog';
import { ExportSettings } from '@/lib/pdfExport';
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

import { ExtractedImage, autoPairImages, createImageFromFile } from '@/lib/imageUtils';

interface SortableImageProps {
  image: ExtractedImage;
  onRotate: (id: string, direction: 'cw' | 'ccw') => void;
  onFlip: (id: string, direction: 'horizontal' | 'vertical') => void;
  onDelete: (id: string) => void;
  onEdit: (image: ExtractedImage) => void;
  onZoom: (image: ExtractedImage) => void;
  onReplace: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAdjust: (image: ExtractedImage) => void;
}

const SortableImage = ({ 
  image, 
  onRotate, 
  onFlip, 
  onDelete, 
  onEdit, 
  onZoom,
  onReplace,
  onDuplicate,
  onAdjust,
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
      <Card className="overflow-hidden border-border hover:shadow-md transition-shadow group">
        <div 
          className="aspect-[85.6/54] bg-muted relative cursor-grab active:cursor-grabbing"
          {...listeners}
        >
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover"
            style={{
              transform: `rotate(${image.rotation}deg) scaleX(${image.flipped ? -1 : 1}) scaleY(${image.flippedVertical ? -1 : 1})`,
              filter: `brightness(${(image.brightness ?? 100) / 100}) contrast(${(image.contrast ?? 100) / 100})`,
              transition: 'transform 0.3s ease, filter 0.2s ease',
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
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onZoom(image);
              }}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="p-2 flex gap-1 justify-center bg-card flex-wrap">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Rotate counter-clockwise"
            onClick={(e) => {
              e.stopPropagation();
              onRotate(image.id, 'ccw');
            }}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Rotate clockwise"
            onClick={(e) => {
              e.stopPropagation();
              onRotate(image.id, 'cw');
            }}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Flip horizontal"
            onClick={(e) => {
              e.stopPropagation();
              onFlip(image.id, 'horizontal');
            }}
          >
            <FlipHorizontal className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Flip vertical"
            onClick={(e) => {
              e.stopPropagation();
              onFlip(image.id, 'vertical');
            }}
          >
            <FlipVertical className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Edit image"
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
            title="Replace image"
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
            title="Adjust brightness/contrast"
            onClick={(e) => {
              e.stopPropagation();
              onAdjust(image);
            }}
          >
            <SunMedium className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Duplicate image"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(image.id);
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Delete image"
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

const IMAGES_PER_PAGE = 20;

const LayoutPage = () => {
  const { state: images, setState: setImages, undo, redo, canUndo, canRedo } = useImageHistory<ExtractedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ExtractedImage | null>(null);
  const [zoomImage, setZoomImage] = useState<ExtractedImage | null>(null);
  const [adjustImage, setAdjustImage] = useState<ExtractedImage | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  // Pagination
  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const startIndex = currentPage * IMAGES_PER_PAGE;
  const paginatedImages = images.slice(startIndex, startIndex + IMAGES_PER_PAGE);

  // Export settings for print preview
  const exportSettings: ExportSettings = {
    paperSize: 'a4',
    gridDensity: '2x4',
    margin: 10,
    padding: 2,
  };

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
        flipped: img.flipped || false,
        flippedVertical: img.flippedVertical || false,
        brightness: img.brightness ?? 100,
        contrast: img.contrast ?? 100,
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

  const rotateImage = useCallback((id: string, direction: 'cw' | 'ccw' = 'cw') => {
    setImages(images.map(img => 
      img.id === id ? { ...img, rotation: (img.rotation + (direction === 'cw' ? 90 : -90) + 360) % 360 } : img
    ));
  }, [images, setImages]);

  const flipImage = useCallback((id: string, direction: 'horizontal' | 'vertical' = 'horizontal') => {
    setImages(images.map(img => 
      img.id === id ? { 
        ...img, 
        flipped: direction === 'horizontal' ? !img.flipped : img.flipped,
        flippedVertical: direction === 'vertical' ? !img.flippedVertical : img.flippedVertical,
      } : img
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
    setImages(images.map(img => ({ 
      ...img, 
      rotation: 0, 
      flipped: false, 
      flippedVertical: false,
      brightness: 100,
      contrast: 100,
    })));
    toast({
      title: 'All Reset',
      description: 'All transformations and adjustments reset',
    });
  };


  const handleDuplicateImage = useCallback((id: string) => {
    const imageToDuplicate = images.find(img => img.id === id);
    if (imageToDuplicate) {
      const newImage: ExtractedImage = {
        ...imageToDuplicate,
        id: `${Date.now()}-${Math.random()}`,
        name: `${imageToDuplicate.name} (copy)`,
      };
      const index = images.findIndex(img => img.id === id);
      const newImages = [...images];
      newImages.splice(index + 1, 0, newImage);
      setImages(newImages);
      toast({
        title: 'Image Duplicated',
        description: 'A copy has been added next to the original',
      });
    }
  }, [images, setImages, toast]);

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
            <Button 
              size="sm" 
              onClick={() => setShowPrintPreview(true)}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Preview
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
        <>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Card className="p-3 border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + IMAGES_PER_PAGE, images.length)} of {images.length} images
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm font-medium px-2">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={paginatedImages.map(img => img.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {paginatedImages.map((image) => (
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
                        onDuplicate={handleDuplicateImage}
                        onAdjust={setAdjustImage}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <Card className="p-3 border-border">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i;
                  if (totalPages > 5) {
                    if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-9"
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </>
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

      {/* Brightness/Contrast Adjustment Dialog */}
      <Dialog open={!!adjustImage} onOpenChange={() => setAdjustImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SunMedium className="h-5 w-5" />
              Adjust Brightness & Contrast
            </DialogTitle>
            <DialogDescription>
              Fine-tune the image appearance before printing
            </DialogDescription>
          </DialogHeader>
          {adjustImage && (
            <div className="space-y-6">
              <div className="aspect-[85.6/54] bg-muted rounded-lg overflow-hidden">
                <img
                  src={adjustImage.url}
                  alt={adjustImage.name}
                  className="w-full h-full object-cover"
                  style={{
                    transform: `rotate(${adjustImage.rotation}deg) scaleX(${adjustImage.flipped ? -1 : 1}) scaleY(${adjustImage.flippedVertical ? -1 : 1})`,
                    filter: `brightness(${(adjustImage.brightness ?? 100) / 100}) contrast(${(adjustImage.contrast ?? 100) / 100})`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground truncate">{adjustImage.name}</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <SunMedium className="h-4 w-4" />
                      Brightness
                    </Label>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {adjustImage.brightness ?? 100}%
                    </span>
                  </div>
                  <Slider
                    value={[adjustImage.brightness ?? 100]}
                    min={20}
                    max={200}
                    step={5}
                    onValueChange={(value) => {
                      const updatedImage = { ...adjustImage, brightness: value[0] };
                      setAdjustImage(updatedImage);
                      setImages(images.map(img => 
                        img.id === adjustImage.id ? updatedImage : img
                      ));
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Contrast className="h-4 w-4" />
                      Contrast
                    </Label>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {adjustImage.contrast ?? 100}%
                    </span>
                  </div>
                  <Slider
                    value={[adjustImage.contrast ?? 100]}
                    min={20}
                    max={200}
                    step={5}
                    onValueChange={(value) => {
                      const updatedImage = { ...adjustImage, contrast: value[0] };
                      setAdjustImage(updatedImage);
                      setImages(images.map(img => 
                        img.id === adjustImage.id ? updatedImage : img
                      ));
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const resetImage = { ...adjustImage, brightness: 100, contrast: 100 };
                    setAdjustImage(resetImage);
                    setImages(images.map(img => 
                      img.id === adjustImage.id ? resetImage : img
                    ));
                  }}
                >
                  Reset to Default
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setAdjustImage(null)}
                >
                  Done
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

      <PrintPreviewDialog
        open={showPrintPreview}
        onOpenChange={setShowPrintPreview}
        images={images}
        settings={exportSettings}
      />
    </div>
  );
};

export default LayoutPage;
