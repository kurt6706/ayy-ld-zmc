import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

initializeApp({
  storageBucket: "supple-dub-g3bk6.firebasestorage.app"
});

async function configureCors() {
  const bucket = getStorage().bucket();
  const corsConfig = [
    {
      origin: ["*"],
      method: ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
      responseHeader: ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"],
      maxAgeSeconds: 3600
    }
  ];
  await bucket.setCorsConfiguration(corsConfig);
  console.log("CORS configured successfully.");
}

configureCors().catch(console.error);
