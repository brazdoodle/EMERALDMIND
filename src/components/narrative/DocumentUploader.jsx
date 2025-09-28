import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DocumentUploader({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" onChange={handleFileChange} className="w-full" />
      <Button onClick={handleUpload} disabled={!selectedFile} className="w-full bg-blue-500 hover:bg-blue-600">
        Upload Document
      </Button>
    </div>
  );
}