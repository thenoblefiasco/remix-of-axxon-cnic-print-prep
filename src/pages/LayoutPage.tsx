import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, Trash2, FlipHorizontal, Edit } from 'lucide-react';
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

interface ExtractedImage {
  id: string;
  name: string;
  url: string;
  type: 'front' | 'back' | 'unknown';
  rotation: number;
  flipped: boolean;
}

const LayoutPage = () => {
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ExtractedImage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = sessionStorage.getItem('extractedImages');
    if (stored) {
      const parsed = JSON.parse(stored);
      setImages(parsed.map((img: ExtractedImage) => ({ 
        ...img, 
        rotation: 0, 
        flipped: false 
      })));
    }
  }, []);

  const rotateImage = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
    ));
  };

  const flipImage = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, flipped: !img.flipped } : img
    ));
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    toast({
      title: 'Image Removed',
      description: 'Image has been deleted from the layout',
    });
  };

  const markAs = (id: string, type: 'front' | 'back') => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, type } : img
    ));
    setSelectedImage(null);
    toast({
      title: 'Image Marked',
      description: `Image marked as ${type}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Layout Adjustments</h2>
          <p className="text-muted-foreground mt-2">
            Arrange your CNIC images in a 2×4 grid layout
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {images.length} images loaded
        </div>
      </div>

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {images.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <Card className="overflow-hidden border-border hover:shadow-md transition-shadow">
                  <div 
                    className="aspect-[85.6/54] bg-muted relative cursor-pointer"
                    onClick={() => setSelectedImage(image)}
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
                  </div>
                  <div className="p-2 flex gap-1 justify-center bg-card">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        rotateImage(image.id);
                      }}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        flipImage(image.id);
                      }}
                    >
                      <FlipHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(image);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
    </div>
  );
};

export default LayoutPage;
