import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { uploadApi } from '../lib/api';

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setUploadStatus('');
      } else {
        setUploadStatus('Please select a CSV file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setUploadStatus('');
      } else {
        setUploadStatus('Please select a CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadStatus('Uploading and processing transactions...');

      // Upload file
      const uploadResult = await uploadApi.uploadCSV(file);
      const jobId = uploadResult.jobId;

      // Poll for completion
      setUploadStatus('Processing CSV and categorizing transactions with AI...');
      let job = await uploadApi.getJobStatus(jobId);

      while (job.status === 'pending' || job.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        job = await uploadApi.getJobStatus(jobId);
      }

      if (job.status === 'failed') {
        throw new Error(job.error_message || 'Upload failed');
      }

      // Confirm upload to save to database
      setUploadStatus('Saving transactions to database...');
      await uploadApi.confirmUpload(jobId);

      const count = job.total_transactions || 0;
      setUploadStatus(`✅ Successfully uploaded and categorized ${count} transactions!\n\nTransactions have been automatically categorized using AI.`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload failed:', error);

      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      if (errorMessage.includes('credit') || errorMessage.includes('API') || errorMessage.includes('ANTHROPIC')) {
        setUploadStatus('⚠️ File uploaded but AI categorization is unavailable.\n\nThis feature requires Anthropic API credits. Transactions have been imported but will need manual categorization.');
      } else {
        setUploadStatus('❌ Upload failed. Please check the file format and try again.\n\nError: ' + errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Upload Transactions</h1>
        <p className="text-muted-foreground mt-2">Import CSV files from your bank</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Upload</CardTitle>
          <CardDescription>
            Upload transaction files from Chase Bank (more banks coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="font-semibold mb-2">
              {file ? file.name : 'Drop CSV file here'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse your files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Select File
            </Button>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Processing...' : 'Upload'}
              </Button>
            </div>
          )}

          {uploadStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              uploadStatus.startsWith('✅')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : uploadStatus.startsWith('❌')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {uploadStatus}
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-medium mb-2">Supported Banks:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Chase Bank (checking & credit cards)</li>
              <li>• More banks coming soon...</li>
            </ul>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-2">File Format Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• File must be in CSV format (.csv)</li>
              <li>• Should contain columns for date, description, and amount</li>
              <li>• Transactions will be automatically categorized using AI</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
