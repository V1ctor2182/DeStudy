"use client";

import { useState, useRef } from "react";
import { useIPFS } from "@/hooks/useIPFS";

interface FileUploaderProps {
  onUploadComplete: (cid: string) => void;
  onError: (error: Error) => void;
}

const ALLOWED_TYPES = ["application/pdf", "text/markdown", "image/png", "image/jpeg"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploader({ onUploadComplete, onError }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress } = useIPFS();

  const validateFile = (selectedFile: File): boolean => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      onError(new Error("Invalid file type. Allowed: PDF, Markdown, PNG, JPG"));
      return false;
    }

    // Validate file size
    if (selectedFile.size > MAX_SIZE) {
      onError(new Error("File too large. Maximum size: 50MB"));
      return false;
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await upload(file);
      onUploadComplete(result.cid);
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* File Input */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
          isDragging
            ? "border-primary-600 bg-primary-50"
            : "border-gray-300 hover:border-primary-500"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.md,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {file ? (
          <div>
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">📁</div>
            <p className="text-lg text-gray-600">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 mt-2">PDF, MD, PNG, JPG (max 50MB)</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {file && !uploading && (
        <button
          onClick={handleUpload}
          className="w-full mt-4 btn-primary"
        >
          Upload to IPFS
        </button>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {progress}% uploaded
          </p>
        </div>
      )}
    </div>
  );
}
