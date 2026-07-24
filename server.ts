import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { users, googleTokens, clubTasks, clubSheets, clubDriveFiles, clubCalendarEvents } from "./src/db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI support chatbot using Gemini 3.5 Flash
  app.post("/api/gemini/support", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message parameter is required" });
      }

      // Initialize Gemini Client
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback response if API Key is not configured yet
        return res.json({
          text: "Merhaba! Ben Ayyıldız Moto Kulübü Canlı Destek Yapay Zeka Asistanıyım. Şu anda arka planda ufak bir ayar yapıyorum (API anahtarı henüz tanımlanmamış), ancak size kulübümüz hakkında genel bilgi vermekten mutluluk duyarım! Telsiz kullanımı, üyelik şartlarımız, disiplin kurallarımız veya neden bizi seçmeniz gerektiği gibi konularda sorular sorabilirsiniz. Tekeriniz düz bassın!"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Prepare contents with history if provided, or simple prompt
      let contents: any[] = [];
      if (history && Array.isArray(history)) {
        contents = history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        }));
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: `Sen Ayyıldız Moto Kulübü'nün (Ayyıldız Moto Kulüp) 7/24 canlı destek asistanısın. Kulübümüzü temsil ediyorsun. Samimi, motorcu dostu, hevesli ve cana yakın bir dille konuşmalısın. Motorculara "tekeriniz düz bassın", "rüzgarınız bol olsun", "yolunuz açık olsun" gibi hitaplar kullanabilirsin.

Önemli Bilgiler:
1. **Telsiz Kullanımı**: Sürüşlerimizde telsiz iletişimi hayati önem taşır. Genellikle UHF veya PMR telsizler tercih edilir. Sürüş başlamadan önce frekans ve kanal ayarları tüm grup için ortak ayarlanır. Sürüş esnasında telsizden boş lakırdı yapılmaz, sadece yol kaptanlarının (öncü/artçı) yönlendirmeleri, yol engelleri, güvenlik uyarıları veya rota bilgileri aktarılır.
2. **Nasıl Üye Olunur?**: Üye olmak için web sitemizdeki sağ üstte bulunan "Üye Girişi" (veya menüdeki Üye Giriş Paneli) üzerinden sisteme kaydolabilirsiniz. Kaydolduktan sonra profil bilgilerinizi doldurun. Aktif sürüşlerimize katılarak, disiplinli duruş sergileyerek ve kulüp tüzüğünü benimseyerek aday üyelikten resmi üyeliğe geçiş yapabilirsiniz.
3. **Neden Bizi Seçmelisiniz?**: Çünkü biz sadece sürüş yapmıyoruz; yüksek güvenlik bilincine sahip, güçlü kardeşlik ve dostluk bağları olan, deneyimli yol kaptanları rehberliğinde keyifli rotalar çizen, telsizli ve disiplinli sürüş eğitimi sunan bir aileyiz! Sosyal sorumluluk projeleri, milli değerlerimize bağlılık ve kaliteli etkinliklerimizle fark yaratıyoruz.
4. **Disiplin Kuralları**: Grup sürüşlerinde fermuar düzeni (ikili zikzak düzeni) uygulanır. Yol kaptanı (öncü) ve artçı geçilemez. Güvenlik ekipmanları (kask, korumalı ceket, eldiven, korumalı pantolon, bot) eksiksiz olmak zorundadır. Alkol veya sürüş güvenliğini tehlikeye atacak maddeler kesinlikle yasaktır. Trafik kurallarına harfiyen riayet edilir.

Sorulara motorcu samimiyetiyle, net ve çok uzun olmayan cevaplar ver. Kullanıcılara kulübün rüzgarını ve kardeşlik ruhunu hissettir!`,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini support error:", error);
      res.status(500).json({ error: error.message || "Yapay zeka asistanı yanıt verirken bir hata oluştu." });
    }
  });

  // Helper to fetch user's active Google Token from database
  async function getGoogleToken(uid: string): Promise<string> {
    try {
      const tokenRecord = await db
        .select()
        .from(googleTokens)
        .where(eq(googleTokens.userId, uid))
        .limit(1);
      
      if (!tokenRecord || tokenRecord.length === 0) {
        throw new Error("Google access token not found. Please log in with Google to authorize.");
      }
      return tokenRecord[0].accessToken;
    } catch (error: any) {
      console.error("Failed to get Google token from db:", error);
      throw new Error(error.message || "Failed to get authorized token");
    }
  }

  // API Route: Register user and store their Google Access Token in Cloud SQL
  app.post("/api/auth/token", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      const name = req.user?.name || email.split("@")[0];

      if (!uid) {
        return res.status(400).json({ error: "Missing user UID in request" });
      }

      const { accessToken } = req.body;

      // 1. Upsert user in SQL DB
      const userResult = await db
        .insert(users)
        .values({
          uid,
          name,
          email,
          role: "member",
          status: "approved",
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: { name, email },
        })
        .returning();

      // 2. Upsert token if accessToken was provided
      if (accessToken) {
        await db
          .insert(googleTokens)
          .values({
            userId: uid,
            accessToken,
          })
          .onConflictDoUpdate({
            target: googleTokens.userId,
            set: { accessToken, updatedAt: new Date() },
          });
      }

      res.json({ success: true, user: userResult[0] });
    } catch (error: any) {
      console.error("Token registration failed:", error);
      res.status(500).json({ error: error.message || "Registration failed" });
    }
  });

  // API Route: Get workspace status (is Google token configured?)
  app.get("/api/workspace/status", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Unauthorized" });

      const tokenRecord = await db
        .select()
        .from(googleTokens)
        .where(eq(googleTokens.userId, uid))
        .limit(1);

      res.json({ hasToken: tokenRecord && tokenRecord.length > 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // GOOGLE DRIVE API PROXIES
  // ==========================================
  app.get("/api/drive/files", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);

      // Fetch files from Google Drive
      const driveRes = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=15&fields=files(id,name,mimeType,webViewLink,iconLink)", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!driveRes.ok) {
        const errText = await driveRes.text();
        return res.status(driveRes.status).json({ error: `Google Drive API error: ${errText}` });
      }

      const data = await driveRes.json();
      
      // Update cache in Cloud SQL
      if (data.files) {
        for (const file of data.files) {
          try {
            await db
              .insert(clubDriveFiles)
              .values({
                fileId: file.id,
                name: file.name,
                webViewLink: file.webViewLink || "",
                mimeType: file.mimeType || "",
              })
              .onConflictDoUpdate({
                target: clubDriveFiles.fileId,
                set: { name: file.name },
              });
          } catch (e) {
            console.warn("Could not cache file:", e);
          }
        }
      }

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/drive/upload", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);
      const { name, content } = req.body;

      if (!name) return res.status(400).json({ error: "Filename is required" });

      // Create file metadata and content in Drive using multi-part upload or simple upload
      // For simplicity, we use simple text upload for text/plain files:
      const meta = { name, mimeType: "text/plain" };
      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
      form.append("file", new Blob([content || "Ayyıldız Moto Kulüp Belgesi"], { type: "text/plain" }));

      const driveRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!driveRes.ok) {
        const errText = await driveRes.text();
        return res.status(driveRes.status).json({ error: `Google Drive upload failed: ${errText}` });
      }

      const file = await driveRes.json();
      
      // Cache in SQL
      await db
        .insert(clubDriveFiles)
        .values({
          fileId: file.id,
          name: file.name,
          webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
          mimeType: file.mimeType,
        })
        .onConflictDoUpdate({
          target: clubDriveFiles.fileId,
          set: { name: file.name },
        });

      res.json(file);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // GOOGLE TASKS API PROXIES
  // ==========================================
  app.get("/api/tasks", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);

      // Fetch tasklists or tasks from primary task list
      const tasksRes = await fetch("https://tasks.googleapis.com/v1/lists/@default/tasks?maxResults=15", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!tasksRes.ok) {
        const errText = await tasksRes.text();
        return res.status(tasksRes.status).json({ error: `Google Tasks error: ${errText}` });
      }

      const data = await tasksRes.json();
      
      // Sync with SQL database table `club_tasks`
      if (data.items) {
        for (const task of data.items) {
          try {
            await db
              .insert(clubTasks)
              .values({
                userId: uid,
                title: task.title,
                notes: task.notes || "",
                status: task.status || "needsAction",
                dueDate: task.due || "",
                googleTaskId: task.id,
              })
              .onConflictDoNothing(); // Keep local edits or prevent key violation
          } catch (e) {
            console.warn("Could not cache task:", e);
          }
        }
      }

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);
      const { title, notes, dueDate } = req.body;

      if (!title) return res.status(400).json({ error: "Task title is required" });

      const tasksRes = await fetch("https://tasks.googleapis.com/v1/lists/@default/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          notes,
          due: dueDate ? new Date(dueDate).toISOString() : undefined,
        }),
      });

      if (!tasksRes.ok) {
        const errText = await tasksRes.text();
        return res.status(tasksRes.status).json({ error: `Google Tasks create error: ${errText}` });
      }

      const task = await tasksRes.json();

      // Save in SQL
      await db
        .insert(clubTasks)
        .values({
          userId: uid,
          title: task.title,
          notes: task.notes || "",
          status: task.status,
          dueDate: task.due || "",
          googleTaskId: task.id,
        });

      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // GOOGLE CALENDAR API PROXIES
  // ==========================================
  app.get("/api/calendar/events", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);

      const calRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=15", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!calRes.ok) {
        const errText = await calRes.text();
        return res.status(calRes.status).json({ error: `Google Calendar error: ${errText}` });
      }

      const data = await calRes.json();

      // Cache events in Cloud SQL
      if (data.items) {
        for (const ev of data.items) {
          try {
            await db
              .insert(clubCalendarEvents)
              .values({
                eventId: ev.id,
                title: ev.summary || "Sürüş Etkinliği",
                description: ev.description || "",
                location: ev.location || "",
                startTime: ev.start?.dateTime || ev.start?.date || "",
                endTime: ev.end?.dateTime || ev.end?.date || "",
              })
              .onConflictDoUpdate({
                target: clubCalendarEvents.eventId,
                set: { title: ev.summary || "Sürüş Etkinliği" },
              });
          } catch (e) {
            console.warn("Could not cache event:", e);
          }
        }
      }

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/calendar/events", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);
      const { title, description, location, startTime, endTime } = req.body;

      if (!title || !startTime || !endTime) {
        return res.status(400).json({ error: "Title, startTime, and endTime are required" });
      }

      const calRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: title,
          description,
          location,
          start: { dateTime: new Date(startTime).toISOString() },
          end: { dateTime: new Date(endTime).toISOString() },
        }),
      });

      if (!calRes.ok) {
        const errText = await calRes.text();
        return res.status(calRes.status).json({ error: `Google Calendar create failed: ${errText}` });
      }

      const event = await calRes.json();

      // Cache in SQL
      await db
        .insert(clubCalendarEvents)
        .values({
          eventId: event.id,
          title: event.summary,
          description: event.description || "",
          location: event.location || "",
          startTime: event.start?.dateTime || "",
          endTime: event.end?.dateTime || "",
        });

      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // GOOGLE SHEETS API PROXIES
  // ==========================================
  app.get("/api/sheets", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);

      // Retrieve spreadsheets from Google Drive that are sheets (mimeType = 'application/vnd.google-apps.spreadsheet')
      const sheetsRes = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&pageSize=10&fields=files(id,name,webViewLink)", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!sheetsRes.ok) {
        const errText = await sheetsRes.text();
        return res.status(sheetsRes.status).json({ error: `Google Sheets fetch error: ${errText}` });
      }

      const data = await sheetsRes.json();

      // Sync with SQL database `club_sheets`
      if (data.files) {
        for (const file of data.files) {
          try {
            await db
              .insert(clubSheets)
              .values({
                sheetId: file.id,
                title: file.name,
                url: file.webViewLink || "",
                description: "Google E-Tablolar sürüş dökümanı",
              });
          } catch (e) {
            // Ignore duplicates, we don't have unique constraint on sheets
          }
        }
      }

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sheets", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);
      const { title } = req.body;

      if (!title) return res.status(400).json({ error: "Spreadsheet title is required" });

      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: { title },
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        return res.status(createRes.status).json({ error: `Google Sheets creation failed: ${errText}` });
      }

      const sheet = await createRes.json();

      // Save to SQL
      await db
        .insert(clubSheets)
        .values({
          sheetId: sheet.spreadsheetId,
          title: sheet.properties.title,
          url: sheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}/edit`,
          description: "Yeni oluşturulan sürüş e-tablosu",
        });

      res.json(sheet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // GOOGLE SLIDES API PROXIES
  // ==========================================
  app.get("/api/slides", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);

      // Retrieve presentations from Google Drive that are slides (mimeType = 'application/vnd.google-apps.presentation')
      const slidesRes = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.presentation'&pageSize=10&fields=files(id,name,webViewLink)", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!slidesRes.ok) {
        const errText = await slidesRes.text();
        return res.status(slidesRes.status).json({ error: `Google Slides fetch error: ${errText}` });
      }

      const data = await slidesRes.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/slides", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);
      const { title } = req.body;

      if (!title) return res.status(400).json({ error: "Presentation title is required" });

      const createRes = await fetch("https://slides.googleapis.com/v1/presentations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        return res.status(createRes.status).json({ error: `Google Slides creation failed: ${errText}` });
      }

      const presentation = await createRes.json();
      res.json(presentation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // GOOGLE CHAT API PROXIES
  // ==========================================
  app.get("/api/chat/spaces", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);

      // Fetch spaces from Google Chat
      const spacesRes = await fetch("https://chat.googleapis.com/v1/spaces", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!spacesRes.ok) {
        const errText = await spacesRes.text();
        return res.status(spacesRes.status).json({ error: `Google Chat API error: ${errText}` });
      }

      const data = await spacesRes.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat/messages", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);
      const { spaceId, text } = req.body;

      if (!spaceId || !text) {
        return res.status(400).json({ error: "spaceId and text are required" });
      }

      // Send chat message in Google Chat
      const msgRes = await fetch(`https://chat.googleapis.com/v1/spaces/${spaceId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      });

      if (!msgRes.ok) {
        const errText = await msgRes.text();
        return res.status(msgRes.status).json({ error: `Google Chat message sending failed: ${errText}` });
      }

      const msg = await msgRes.json();
      res.json(msg);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // GOOGLE PEOPLE API (CONTACTS) PROXIES
  // ==========================================
  app.get("/api/contacts", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);

      // Fetch connections (contacts) from Google People API
      const contactsRes = await fetch("https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=100", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!contactsRes.ok) {
        const errText = await contactsRes.text();
        return res.status(contactsRes.status).json({ error: `Google People API error: ${errText}` });
      }

      const data = await contactsRes.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contacts", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);
      const { name, email, phone } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const body: any = {
        names: [
          {
            givenName: name,
          }
        ]
      };

      if (email) {
        body.emailAddresses = [
          {
            value: email,
            type: "home"
          }
        ];
      }

      if (phone) {
        body.phoneNumbers = [
          {
            value: phone,
            type: "mobile"
          }
        ];
      }

      // Create contact using Google People API
      const createRes = await fetch("https://people.googleapis.com/v1/people:createContact", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        return res.status(createRes.status).json({ error: `Google Contacts creation failed: ${errText}` });
      }

      const contact = await createRes.json();
      res.json(contact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/contacts", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid!;
      const token = await getGoogleToken(uid);
      const { resourceName } = req.query;

      if (!resourceName || typeof resourceName !== 'string') {
        return res.status(400).json({ error: "resourceName is required as query parameter" });
      }

      // Delete contact using Google People API
      const deleteRes = await fetch(`https://people.googleapis.com/v1/${resourceName}:deleteContact`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!deleteRes.ok) {
        const errText = await deleteRes.text();
        return res.status(deleteRes.status).json({ error: `Google Contacts deletion failed: ${errText}` });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
