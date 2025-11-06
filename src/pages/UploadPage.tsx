import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ExtractedImage {
  id: string;
  name: string;
  url: string;
  type: 'front' | 'back' | 'unknown';
}

const UploadPage = () => {
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const zipFile = acceptedFiles[0];
    if (!zipFile) return;

    setIsProcessing(true);
    
    try {
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      const extractedImages: ExtractedImage[] = [];

      // Extract images from ZIP
      for (const [filename, file] of Object.entries(zipData.files)) {
        if (!file.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
          const blob = await file.async('blob');
          const url = URL.createObjectURL(blob);
          
          extractedImages.push({
            id: `${Date.now()}-${filename}`,
            name: filename,
            url,
            type: 'unknown',
          });
        }
      }

      if (extractedImages.length === 0) {
        toast({
          title: 'No Images Found',
          description: 'The ZIP file does not contain any valid images',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Store images in sessionStorage for access across pages
      sessionStorage.setItem('extractedImages', JSON.stringify(extractedImages));
      setImages(extractedImages);
      
      toast({
        title: 'Images Extracted',
        description: `Successfully extracted ${extractedImages.length} images`,
      });

      // Navigate to layout page after successful extraction
      setTimeout(() => {
        navigate('/layout');
      }, 1000);
      
    } catch (error) {
      toast({
        title: 'Extraction Failed',
        description: 'Failed to extract images from ZIP file',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Upload Images</h2>
        <p className="text-muted-foreground mt-2">
          Upload a ZIP file containing CNIC images for bulk printing
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Upload ZIP File</CardTitle>
          <CardDescription>
            Drag and drop a ZIP file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              ${isProcessing ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: isDragActive ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-foreground font-medium">Processing ZIP file...</p>
                </>
              ) : (
                <>
                  <FileArchive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    {isDragActive ? 'Drop the ZIP file here' : 'Drag & drop a ZIP file'}
                  </p>
                  <p className="text-muted-foreground text-sm">or click to browse</p>
                </>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <CardTitle>Extraction Complete</CardTitle>
              </div>
              <CardDescription>
                {images.length} images successfully extracted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to layout page...
              </p>
              <Button onClick={() => navigate('/layout')}>
                Go to Layout
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default UploadPage;
