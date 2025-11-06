import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import TopBar from '@/components/TopBar';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // PDF download logic will be implemented in the grid component
    const event = new CustomEvent('downloadPDF');
    window.dispatchEvent(event);
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
    </SidebarProvider>
  );
};

export default Dashboard;
