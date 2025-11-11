"use client";

import { useState } from "react";
import { uploadToIPFS, UploadProgress, UploadResult } from "@/lib/ipfs/client";

export function useIPFS() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const upload = async (file: File): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const uploadResult = await uploadToIPFS(file, (prog: UploadProgress) => {
        setProgress(prog.percentage);
      });

      setResult(uploadResult);
      return uploadResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Upload failed");
      setError(error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  };

  return {
    upload,
    reset,
    uploading,
    progress,
    error,
    result,
  };
}
