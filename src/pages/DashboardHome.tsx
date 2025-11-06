import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, LayoutGrid, FileOutput, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Upload Images',
      description: 'Upload a ZIP file containing CNIC images',
      icon: Upload,
      path: '/upload',
      color: 'from-blue-500/10 to-blue-500/5',
    },
    {
      title: 'Layout Adjustments',
      description: 'Arrange and organize your CNIC layout',
      icon: LayoutGrid,
      path: '/layout',
      color: 'from-green-500/10 to-green-500/5',
    },
    {
      title: 'Print & Export',
      description: 'Print or download your arranged layout',
      icon: FileOutput,
      path: '/export',
      color: 'from-purple-500/10 to-purple-500/5',
    },
    {
      title: 'Settings',
      description: 'Configure paper size, margins, and grid',
      icon: Settings,
      path: '/settings',
      color: 'from-orange-500/10 to-orange-500/5',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Welcome to Axxon Formix</h2>
        <p className="text-muted-foreground mt-2">
          Professional CNIC layout and printing tool for bulk operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-border"
              onClick={() => navigate(card.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
              1
            </div>
            <p>Upload a ZIP file containing your CNIC images (front and back sides)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
              2
            </div>
            <p>Arrange images in the 2×4 grid layout, mark front and back sides</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
              3
            </div>
            <p>Configure print settings like paper size and margins in Settings</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
              4
            </div>
            <p>Print directly or download as PDF for later printing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
