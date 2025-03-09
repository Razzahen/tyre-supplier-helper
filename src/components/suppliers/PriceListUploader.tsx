
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/custom/Card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileUp, Check, AlertCircle, Loader2 } from 'lucide-react';
import { PriceListRow, ProcessedPriceList } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [results, setResults] = useState<PriceListRow[]>([]);

  const processPriceList = async (file: File): Promise<ProcessedPriceList> => {
    setUploadStatus('uploading');
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 20) {
      setProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    
    // Convert file to base64
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    setUploadStatus('processing');
    
    try {
      // Call the Supabase Edge Function to process the file
      const { data, error } = await supabase.functions.invoke('process-price-list', {
        body: {
          file: fileBase64,
          supplierId,
          fileName: file.name
        }
      });
      
      if (error) {
        console.error('Error calling process-price-list function:', error);
        throw new Error(error.message || 'Failed to process the price list');
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to process the price list');
      }
      
      setResults(data.data.rows);
      
      return {
        supplierId,
        rows: data.data.rows,
      };
    } catch (error) {
      console.error('Error processing price list:', error);
      throw error;
    }
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
      setErrorMessage(error.message || 'Failed to process the price list. Please try again or use a different file format.');
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
              Price list successfully processed. {results.length} tyre prices imported.
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
          Upload a price list for {supplierName}. We'll extract tyre information automatically using AI.
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

        {uploadStatus === 'success' && results.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted py-2 px-4 text-sm font-medium">
              Preview ({Math.min(3, results.length)} of {results.length})
            </div>
            <div className="p-4 space-y-3">
              {results.slice(0, 3).map((row, index) => (
                <div key={index} className="text-sm p-2 bg-accent/20 rounded">
                  <span className="font-medium">{row.brand} {row.model}</span>
                  <span className="mx-2">·</span>
                  <span className="text-muted-foreground">{row.size}</span>
                  <span className="mx-2">·</span>
                  <span>${row.cost.toFixed(2)}</span>
                </div>
              ))}
              {results.length > 3 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  and {results.length - 3} more items
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
