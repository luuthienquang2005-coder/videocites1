/**
 * Upload helper that sends video files to the server and returns a persistent public URL (/uploads/...)
 * This allows all users across all machines to stream the video from the server & Firestore.
 */

export interface UploadVideoResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
}

/**
 * Uploads a video File object to the backend server
 */
export async function uploadVideoToServer(file: File, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("video", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText) as UploadVideoResponse;
          if (res && res.url) {
            resolve(res.url);
          } else {
            reject(new Error("Server response did not include file url"));
          }
        } catch (e: any) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      } else {
        reject(new Error(`Upload failed with status code ${xhr.status}: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during video upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Video upload was cancelled"));
    });

    xhr.open("POST", "/api/upload-video", true);
    xhr.send(formData);
  });
}

/**
 * Converts a base64 Data URL to a Blob/File and uploads to server as image
 */
export async function uploadThumbnailDataUrlToServer(dataUrl: string): Promise<string> {
  try {
    if (!dataUrl || !dataUrl.startsWith("data:")) return dataUrl;
    
    // Split base64
    const parts = dataUrl.split(",");
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const formData = new FormData();
    formData.append("thumbnail", blob, "cover.jpg");

    const res = await fetch("/api/upload-thumbnail", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return data.url;
      }
    }
    return dataUrl;
  } catch (err) {
    console.warn("Failed to upload thumbnail to server, falling back to data URL:", err);
    return dataUrl;
  }
}
