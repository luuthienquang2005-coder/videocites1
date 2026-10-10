import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure Multer for disk storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".mp4";
      const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 30);
      const uniqueName = `video-${Date.now()}-${Math.round(Math.random() * 1e6)}-${cleanBase}${ext}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 500 * 1024 * 1024 // 500 MB max video size
    }
  });

  // Support JSON and urlencoded payloads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Serve uploaded files statically under /uploads with proper range support for video streaming
  app.use("/uploads", express.static(uploadsDir, {
    acceptRanges: true,
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (filePath.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
      }
    }
  }));

  // API Endpoint: Upload Video File
  app.post("/api/upload-video", upload.single("video"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      // Generate public URL relative to the domain
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({
        success: true,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: err.message || "Failed to process video upload" });
    }
  });

  // API Endpoint: Upload Thumbnail Image
  const thumbStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const uniqueName = `thumb-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      cb(null, uniqueName);
    }
  });
  const uploadThumb = multer({ storage: thumbStorage, limits: { fileSize: 20 * 1024 * 1024 } });

  app.post("/api/upload-thumbnail", uploadThumb.single("thumbnail"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({
        success: true,
        filename: req.file.filename,
        url: fileUrl
      });
    } catch (err: any) {
      console.error("Thumbnail upload error:", err);
      return res.status(500).json({ error: err.message || "Failed to upload thumbnail" });
    }
  });

  // Serve static assets or use Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Redirect all requests to index.html for React Router SPA behavior
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
