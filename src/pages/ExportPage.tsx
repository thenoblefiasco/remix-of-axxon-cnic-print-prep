import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF, ExportImage, ExportSettings } from '@/lib/pdfExport';
import PrintGuidanceDialog from '@/components/PrintGuidanceDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ExportPage = () => {
  const [images, setImages] = useState<ExportImage[]>([]);
  const [settings, setSettings] = useState<ExportSettings>({
    paperSize: 'a4',
    gridDensity: '2x4',
    margin: 10,
    padding: 5,
  });
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = sessionStorage.getItem('extractedImages');
    if (stored) {
      setImages(JSON.parse(stored));
    }

    const storedSettings = localStorage.getItem('axxonFormixSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handlePrint = () => {
    setShowPrintDialog(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportPDF = async () => {
    if (images.length === 0) {
      toast({
        title: 'No Images',
        description: 'Please upload images first',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(images, settings);
      toast({
        title: 'PDF Exported',
        description: 'Your CNIC layout has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const stats = {
    total: images.length,
    front: images.filter((img) => img.type === 'front').length,
    back: images.filter((img) => img.type === 'back').length,
    unmarked: images.filter((img) => img.type === 'unknown').length,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Print & Export</h2>
        <p className="text-muted-foreground mt-2">
          Print your layout or export as PDF
        </p>
      </div>

      {images.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No images loaded. Please upload images first.
            </p>
            <Button onClick={() => (window.location.href = '/upload')}>
              Upload Images
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Layout Statistics</CardTitle>
              <CardDescription>Overview of your current layout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Images</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{stats.front}</div>
                  <div className="text-sm text-muted-foreground mt-1">Front Sides</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-secondary">{stats.back}</div>
                  <div className="text-sm text-muted-foreground mt-1">Back Sides</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-muted-foreground">{stats.unmarked}</div>
                  <div className="text-sm text-muted-foreground mt-1">Unmarked</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {stats.unmarked > 0 && (
            <Alert>
              <AlertDescription>
                You have {stats.unmarked} unmarked image{stats.unmarked > 1 ? 's' : ''}. 
                Consider marking them as front or back for better organization.
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Choose how to output your layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => setShowPrintDialog(true)}
                >
                  <Printer className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Print Layout</div>
                    <div className="text-xs opacity-80">Direct printing with browser</div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="h-auto py-6 flex-col gap-2"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  <Download className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">
                      {isExporting ? 'Generating...' : 'Download PDF'}
                    </div>
                    <div className="text-xs opacity-80">Save for later printing</div>
                  </div>
                </Button>
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                <p><strong>Current Settings:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Paper Size: {settings.paperSize.toUpperCase()}</li>
                  <li>Grid Layout: {settings.gridDensity}</li>
                  <li>Page Margin: {settings.margin}mm</li>
                  <li>Image Padding: {settings.padding}mm</li>
                </ul>
                <Button
                  variant="link"
                  className="px-0"
                  onClick={() => (window.location.href = '/settings')}
                >
                  Change Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Print Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>Use high-quality paper (200-250 GSM) for professional results</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>Ensure printer settings are set to 100% scale (actual size)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>Test with a single sheet before bulk printing</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  4
                </div>
                <p>For duplex printing, follow the guidance dialog carefully</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <PrintGuidanceDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        onProceed={handlePrint}
      />
    </div>
  );
};

export default ExportPage;
