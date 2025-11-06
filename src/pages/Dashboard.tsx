import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import TopBar from '@/components/TopBar';
import PrintGuidanceDialog from '@/components/PrintGuidanceDialog';
import { Outlet } from 'react-router-dom';
import { exportToPDF } from '@/lib/pdfExport';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleShowPrintGuidance = () => {
      setShowPrintDialog(true);
    };

    window.addEventListener('showPrintGuidance', handleShowPrintGuidance);
    return () => window.removeEventListener('showPrintGuidance', handleShowPrintGuidance);
  }, []);

  const handlePrint = () => {
    setShowPrintDialog(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = async () => {
    const stored = sessionStorage.getItem('extractedImages');
    if (!stored) {
      toast({
        title: 'No Images',
        description: 'Please upload images first',
        variant: 'destructive',
      });
      return;
    }

    const images = JSON.parse(stored);
    const storedSettings = localStorage.getItem('axxonFormixSettings');
    const settings = storedSettings ? JSON.parse(storedSettings) : {
      paperSize: 'a4',
      gridDensity: '2x4',
      margin: 10,
      padding: 5,
    };

    try {
      await exportToPDF(images, settings);
      toast({
        title: 'PDF Downloaded',
        description: 'Your CNIC layout has been saved',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <TopBar onPrint={handlePrint} onDownloadPDF={handleDownloadPDF} />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
          <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
            © 2025 Axxon Formix — A product of Axxon Systems
          </footer>
        </div>
      </div>
      <PrintGuidanceDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        onProceed={handlePrint}
      />
    </SidebarProvider>
  );
};

export default Dashboard;
