import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

initializeApp({
  storageBucket: "supple-dub-g3bk6.firebasestorage.app"
});

async function check() {
  const bucket = getStorage().bucket();
  const [exists] = await bucket.exists();
  console.log("supple-dub-g3bk6.firebasestorage.app exists:", exists);
}

check().catch(console.error);
