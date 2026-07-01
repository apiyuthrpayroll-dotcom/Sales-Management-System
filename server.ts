import express from "express";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Run PHP version diagnostic
  try {
    const { execSync } = await import("child_process");
    const { writeFileSync } = await import("fs");
    const phpVer = execSync("php -v").toString();
    writeFileSync(path.join(process.cwd(), "php-status.txt"), "PHP IS INSTALLED:\n" + phpVer);
  } catch (e: any) {
    try {
      const { writeFileSync } = await import("fs");
      writeFileSync(path.join(process.cwd(), "php-status.txt"), "PHP NOT INSTALLED:\n" + e.message);
    } catch (fsErr) {
      console.error("FS error:", fsErr);
    }
  }

  app.use(express.json());

  // API routes
  app.get("/api/health", async (req, res) => {
    let phpVersion = "not found";
    try {
      const { execSync } = await import("child_process");
      phpVersion = execSync("php -v").toString();
    } catch (e: any) {
      phpVersion = "Error: " + e.message;
    }
    res.json({ status: "ok", phpVersion });
  });

  app.get("/api/audit_logs", async (req, res) => {
    if (!supabase) {
      res.json([]);
      return;
    }
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    } else {
      res.json(data);
    }
  });

  app.post("/api/audit_logs", async (req, res) => {
    const { userId, action, targetType, targetId, details } = req.body;
    
    if (!supabase) {
      console.log(`[AuditLog - Fallback] User: ${userId}, Action: ${action}, Target: ${targetType} (${targetId}), Details: ${details}`);
      res.json({ success: true, message: 'Logged to console' });
      return;
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        action_by: userId, // Assuming userId maps to action_by in the table
        action,
        target_type: targetType,
        target_id: targetId,
        details
      });

    if (error) {
      console.error('Error inserting audit log:', error);
      res.status(500).json({ error: 'Failed to insert log' });
    } else {
      res.json({ success: true });
    }
  });

  app.post("/api/opportunities", (req, res) => {
    const { payload, userId } = req.body;
    // Log to audit_logs (simulated DB call for now)
    console.log(`[AuditLog] User: ${userId}, Action: Create Opportunity, Details: ${JSON.stringify(payload)}`);
    // ... proceed to save to DB ...
    res.json({ success: true, id: "new-id" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
