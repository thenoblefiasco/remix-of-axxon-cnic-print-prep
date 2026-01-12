import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { ExtractedImage } from '@/lib/imageUtils';

const UploadPage = () => {
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const zipFile = acceptedFiles[0];
    if (!zipFile) return;

    setError(null);
    setIsProcessing(true);
    
    try {
      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024;
      if (zipFile.size > maxSize) {
        throw new Error('ZIP file is too large. Maximum size is 50MB.');
      }

      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      const extractedImages: ExtractedImage[] = [];

      // Extract images from ZIP
      for (const [filename, file] of Object.entries(zipData.files)) {
        if (!file.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
          try {
            const blob = await file.async('blob');
            
            // Validate image size
            if (blob.size > 10 * 1024 * 1024) {
              console.warn(`Image ${filename} is too large (max 10MB), skipping`);
              continue;
            }
            
            const url = URL.createObjectURL(blob);
            
            extractedImages.push({
              id: `${Date.now()}-${filename}-${Math.random()}`,
              name: filename,
              url,
              type: 'unknown',
              rotation: 0,
              flipped: false,
              flippedVertical: false,
              brightness: 100,
              contrast: 100,
            });
          } catch (err) {
            console.error(`Failed to process ${filename}:`, err);
          }
        }
      }

      if (extractedImages.length === 0) {
        throw new Error('No valid images found in ZIP file');
      }

      // Limit to 100 images
      if (extractedImages.length > 100) {
        toast({
          title: 'Too Many Images',
          description: 'Only the first 100 images will be loaded',
        });
        extractedImages.splice(100);
      }

      // Store images in sessionStorage
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract images from ZIP file';
      setError(errorMessage);
      toast({
        title: 'Extraction Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, navigate]);

  const maxZipSize = 50 * 1024 * 1024; // 50MB
  
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxFiles: 1,
    maxSize: maxZipSize,
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError('ZIP file is too large. Maximum size is 50MB.');
        toast({
          title: 'File Too Large',
          description: 'Maximum ZIP file size is 50MB',
          variant: 'destructive',
        });
      }
    },
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
            Drag and drop a ZIP file containing CNIC images (max 50MB, up to 100 images)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
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

          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p>• Supported formats: JPG, PNG, GIF, WEBP</p>
            <p>• Maximum ZIP size: 50MB</p>
            <p>• Maximum images: 100 per upload</p>
            <p>• Maximum image size: 10MB per image</p>
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
