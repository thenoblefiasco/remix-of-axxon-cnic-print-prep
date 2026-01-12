import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Printer, FileDown } from 'lucide-react';
import { ExtractedImage } from '@/lib/imageUtils';
import { exportToPDF, ExportSettings } from '@/lib/pdfExport';
import { useToast } from '@/hooks/use-toast';

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: ExtractedImage[];
  settings: ExportSettings;
}

const PrintPreviewDialog = ({ 
  open, 
  onOpenChange, 
  images,
  settings,
}: PrintPreviewDialogProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  // Calculate grid
  const [cols, rows] = settings.gridDensity.split('x').map(Number);
  const imagesPerPage = cols * rows;
  const totalPages = Math.ceil(images.length / imagesPerPage);

  // Get images for current page
  const startIndex = currentPage * imagesPerPage;
  const pageImages = images.slice(startIndex, startIndex + imagesPerPage);

  // Separate front and back for duplex preview
  const frontImages = images.filter(img => img.type === 'front');
  const backImages = images.filter(img => img.type === 'back');

  const handleExport = async () => {
    try {
      await exportToPDF(images, settings);
      toast({
        title: 'PDF Exported',
        description: 'Your print-ready PDF has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Preview
          </DialogTitle>
          <DialogDescription>
            Preview how your CNIC images will appear when printed. Front and back sides are shown separately for duplex printing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Total: {images.length} images</Badge>
            <Badge variant="default">Front: {frontImages.length}</Badge>
            <Badge variant="secondary">Back: {backImages.length}</Badge>
            <Badge variant="outline">Pages: {totalPages}</Badge>
          </div>

          {/* Front Side Preview */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Front Side
              <Badge>{frontImages.length} cards</Badge>
            </h3>
            <Card className="p-4 bg-muted/30">
              {frontImages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No images marked as front side
                </p>
              ) : (
                <div 
                  className="grid gap-2"
                  style={{ 
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  }}
                >
                  {frontImages.slice(0, imagesPerPage).map((image) => (
                    <div 
                      key={image.id}
                      className="aspect-[85.6/54] bg-white rounded border overflow-hidden shadow-sm"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        style={{
                          transform: `rotate(${image.rotation}deg) scaleX(${image.flipped ? -1 : 1}) scaleY(${image.flippedVertical ? -1 : 1})`,
                          filter: `brightness(${(image.brightness ?? 100) / 100}) contrast(${(image.contrast ?? 100) / 100})`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {frontImages.length > imagesPerPage && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  +{frontImages.length - imagesPerPage} more on additional pages
                </p>
              )}
            </Card>
          </div>

          {/* Back Side Preview */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Back Side
              <Badge variant="secondary">{backImages.length} cards</Badge>
            </h3>
            <Card className="p-4 bg-muted/30">
              {backImages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No images marked as back side
                </p>
              ) : (
                <div 
                  className="grid gap-2"
                  style={{ 
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  }}
                >
                  {backImages.slice(0, imagesPerPage).map((image) => (
                    <div 
                      key={image.id}
                      className="aspect-[85.6/54] bg-white rounded border overflow-hidden shadow-sm"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        style={{
                          transform: `rotate(${image.rotation}deg) scaleX(${image.flipped ? -1 : 1}) scaleY(${image.flippedVertical ? -1 : 1})`,
                          filter: `brightness(${(image.brightness ?? 100) / 100}) contrast(${(image.contrast ?? 100) / 100})`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {backImages.length > imagesPerPage && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  +{backImages.length - imagesPerPage} more on additional pages
                </p>
              )}
            </Card>
          </div>

          {/* Page by Page Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">All Images - Page {currentPage + 1} of {totalPages}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                  {startIndex + 1}-{Math.min(startIndex + imagesPerPage, images.length)} of {images.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Card className="p-4 bg-white border-2">
              <div 
                className="grid gap-2"
                style={{ 
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                }}
              >
                {pageImages.map((image) => (
                  <div 
                    key={image.id}
                    className="aspect-[85.6/54] bg-muted rounded border overflow-hidden relative"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      style={{
                        transform: `rotate(${image.rotation}deg) scaleX(${image.flipped ? -1 : 1}) scaleY(${image.flippedVertical ? -1 : 1})`,
                        filter: `brightness(${(image.brightness ?? 100) / 100}) contrast(${(image.contrast ?? 100) / 100})`,
                      }}
                    />
                    {image.type !== 'unknown' && (
                      <Badge 
                        className="absolute top-1 left-1 text-[10px] px-1 py-0"
                        variant={image.type === 'front' ? 'default' : 'secondary'}
                      >
                        {image.type}
                      </Badge>
                    )}
                  </div>
                ))}
                {/* Empty placeholders */}
                {Array.from({ length: imagesPerPage - pageImages.length }).map((_, i) => (
                  <div 
                    key={`empty-${i}`}
                    className="aspect-[85.6/54] bg-muted/30 rounded border border-dashed"
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreviewDialog;
