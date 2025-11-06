import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const [paperSize, setPaperSize] = useState('a4');
  const [gridDensity, setGridDensity] = useState('2x4');
  const [margin, setMargin] = useState([10]);
  const [padding, setPadding] = useState([5]);
  const { toast } = useToast();

  const handleSave = () => {
    const settings = {
      paperSize,
      gridDensity,
      margin: margin[0],
      padding: padding[0],
    };
    localStorage.setItem('axxonFormixSettings', JSON.stringify(settings));
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been saved successfully',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure paper size, margins, and layout preferences
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Paper Settings</CardTitle>
          <CardDescription>Configure paper size and orientation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Paper Size</Label>
            <Select value={paperSize} onValueChange={setPaperSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                <SelectItem value="a5">A5 (148 × 210 mm)</SelectItem>
                <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Layout Settings</CardTitle>
          <CardDescription>Configure grid density and spacing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Grid Density</Label>
            <Select value={gridDensity} onValueChange={setGridDensity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2x4">2 × 4 (Default)</SelectItem>
                <SelectItem value="3x3">3 × 3</SelectItem>
                <SelectItem value="4x4">4 × 4</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Page Margin</Label>
              <span className="text-sm text-muted-foreground">{margin[0]}mm</span>
            </div>
            <Slider
              value={margin}
              onValueChange={setMargin}
              min={0}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Image Padding</Label>
              <span className="text-sm text-muted-foreground">{padding[0]}mm</span>
            </div>
            <Slider
              value={padding}
              onValueChange={setPadding}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Print Guidance</CardTitle>
          <CardDescription>Tips for successful CNIC printing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              1
            </div>
            <p>For duplex printing, print front sides first, then flip paper and print back sides</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              2
            </div>
            <p>Ensure printer is set to actual size (100% scale) with no fit-to-page</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              3
            </div>
            <p>Use high-quality paper for best results with CNIC printing</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
};

export default SettingsPage;
