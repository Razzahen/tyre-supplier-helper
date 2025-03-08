
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/custom/Card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileUp, Check, AlertCircle, Loader2 } from 'lucide-react';
import { PriceListRow, ProcessedPriceList } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PriceListUploaderProps {
  supplierId: string;
  supplierName: string;
  onClose: () => void;
  onUploadComplete: (data: ProcessedPriceList) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

const PriceListUploader = ({
  supplierId,
  supplierName,
  onClose,
  onUploadComplete
}: PriceListUploaderProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [mockResult, setMockResult] = useState<PriceListRow[]>([]);

  // This function would use GPT-4o to process the file in a real implementation
  const processPriceList = async (file: File): Promise<ProcessedPriceList> => {
    // Mock processing for demo purposes
    setUploadStatus('uploading');
    
    // Simulate file upload
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    
    setUploadStatus('processing');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock data - in a real app, this would come from GPT-4o
    const mockData: PriceListRow[] = [
      { size: "205/55R16", brand: "Michelin", model: "Primacy 4", cost: 120 },
      { size: "205/55R16", brand: "Continental", model: "PremiumContact 6", cost: 110 },
      { size: "225/45R17", brand: "Bridgestone", model: "Turanza T005", cost: 145 },
      { size: "225/45R17", brand: "Pirelli", model: "P Zero", cost: 160 },
      { size: "235/35R19", brand: "Michelin", model: "Pilot Sport 4", cost: 210 },
      { size: "265/70R16", brand: "Goodyear", model: "Wrangler AT", cost: 180 },
    ];
    
    setMockResult(mockData);
    
    return {
      supplierId,
      rows: mockData,
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await processPriceList(file);
      setUploadStatus('success');
      toast({
        title: "Success",
        description: `Processed ${result.rows.length} tyre prices`,
      });
      onUploadComplete(result);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Failed to process the price list. Please try again or use a different file format.');
      toast({
        title: "Error",
        description: "Failed to process the price list",
        variant: "destructive",
      });
    }
  };

  const renderUploadStatus = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading file...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        );
      case 'processing':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing with GPT-4o...</span>
              <Loader2 size={16} className="animate-spin" />
            </div>
            <Progress value={100} className="h-2" />
          </div>
        );
      case 'success':
        return (
          <Alert variant="default" className="bg-green-50 text-green-900 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Price list successfully processed. {mockResult.length} tyre prices imported.
            </AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto animate-scale-in">
      <CardHeader>
        <CardTitle>Upload Price List</CardTitle>
        <CardDescription>
          Upload a price list for {supplierName}. We'll extract tyre information automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
          <FileUp size={40} className="text-muted-foreground mb-4" />
          <p className="text-sm text-center text-muted-foreground mb-2">
            Drag & drop your price list file here, or click to browse
          </p>
          <p className="text-xs text-center text-muted-foreground mb-4">
            Supports PDF, Excel, CSV formats
          </p>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
          >
            Select File
          </Button>
        </div>

        {file && (
          <div className="p-3 border rounded-lg bg-accent/30 flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFile(null)}
              disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
            >
              Remove
            </Button>
          </div>
        )}

        {renderUploadStatus()}

        {uploadStatus === 'success' && mockResult.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted py-2 px-4 text-sm font-medium">
              Preview ({Math.min(3, mockResult.length)} of {mockResult.length})
            </div>
            <div className="p-4 space-y-3">
              {mockResult.slice(0, 3).map((row, index) => (
                <div key={index} className="text-sm p-2 bg-accent/20 rounded">
                  <span className="font-medium">{row.brand} {row.model}</span>
                  <span className="mx-2">·</span>
                  <span className="text-muted-foreground">{row.size}</span>
                  <span className="mx-2">·</span>
                  <span>${row.cost.toFixed(2)}</span>
                </div>
              ))}
              {mockResult.length > 3 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  and {mockResult.length - 3} more items
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'processing'}
        >
          {uploadStatus === 'uploading' || uploadStatus === 'processing' ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Upload & Process'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PriceListUploader;
