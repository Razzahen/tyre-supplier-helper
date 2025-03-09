
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/custom/Card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileUp, Check, AlertCircle, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { PriceListRow, ProcessedPriceList } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PriceListUploaderProps {
  supplierId: string;
  supplierName: string;
  onClose: () => void;
  onUploadComplete: (data: ProcessedPriceList) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error' | 'partial-success';

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
  const [invalidRows, setInvalidRows] = useState<string[]>([]);

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
      
      if (data.data.invalidRows && data.data.invalidRows.length > 0) {
        setInvalidRows(data.data.invalidRows);
        setUploadStatus('partial-success');
      } else {
        setUploadStatus('success');
      }
      
      return {
        supplierId,
        rows: data.data.rows,
        errorRows: data.data.invalidRows
      };
    } catch (error) {
      console.error('Error processing price list:', error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is PDF, Excel, or CSV
      const validTypes = ['application/pdf', 'application/vnd.ms-excel', 
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                         'text/csv'];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, Excel, or CSV file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus('idle');
      setErrorMessage('');
      setInvalidRows([]);
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
      
      if (result.rows.length > 0) {
        toast({
          title: "Success",
          description: `Processed ${result.rows.length} tyre prices${result.errorRows && result.errorRows.length > 0 ? ` (${result.errorRows.length} invalid entries skipped)` : ''}`,
        });
        onUploadComplete(result);
      } else {
        setUploadStatus('error');
        setErrorMessage('No valid tyre data found in the document. Please check the file format and content.');
        toast({
          title: "Error",
          description: "No valid tyre data found",
          variant: "destructive",
        });
      }
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
      case 'partial-success':
        return (
          <div className="space-y-4">
            <Alert variant="default" className="bg-yellow-50 text-yellow-900 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Partial Success</AlertTitle>
              <AlertDescription>
                {results.length} tyre prices imported. {invalidRows.length} invalid entries were skipped.
              </AlertDescription>
            </Alert>
            {invalidRows.length > 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                <p className="font-medium text-yellow-900 mb-1">Invalid entries:</p>
                <ul className="list-disc pl-5 text-xs space-y-1 text-yellow-800">
                  {invalidRows.slice(0, 5).map((row, idx) => (
                    <li key={idx}>{row}</li>
                  ))}
                  {invalidRows.length > 5 && (
                    <li>And {invalidRows.length - 5} more...</li>
                  )}
                </ul>
              </div>
            )}
          </div>
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
          {file ? (
            <div className="flex flex-col items-center">
              <FileText size={40} className="text-primary mb-3" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground mb-2">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFile(null)}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              >
                Change file
              </Button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {renderUploadStatus()}

        {(uploadStatus === 'success' || uploadStatus === 'partial-success') && results.length > 0 && (
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
