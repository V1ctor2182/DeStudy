import { UploadProgress, UploadResult } from "./client";

const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export async function uploadToPinata(
    file: File,
    token: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    // Optional: Add metadata
    const metadata = JSON.stringify({
        name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    // Optional: Add options
    const options = JSON.stringify({
        cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", PINATA_API_URL);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentage = Math.round((event.loaded / event.total) * 100);
                onProgress?.({
                    loaded: event.loaded,
                    total: event.total,
                    percentage,
                });
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    const cid = response.IpfsHash;

                    resolve({
                        cid,
                        size: file.size,
                        // Pinata gateway or public gateway
                        url: `https://gateway.pinata.cloud/ipfs/${cid}`,
                    });
                } catch (e) {
                    reject(new Error("Failed to parse Pinata response"));
                }
            } else {
                reject(new Error(`Pinata upload failed: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Network error during Pinata upload"));
        };

        xhr.send(formData);
    });
}
