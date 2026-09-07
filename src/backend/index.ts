import * as fs from 'fs';

export function setupBackend(app: any) {
  app.get('/api/file', (req: any, res: any) => {
    const filePath = req.query.path as string;
    try {
      if (!isPathAllowed(filePath)) return res.status(403).json({ error: 'Access denied' });
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
      const content = fs.readFileSync(filePath, 'utf-8');
      res.send(content);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/file/exists', (req: any, res: any) => {
    const filePath = req.query.path as string;
    try {
      if (!isPathAllowed(filePath)) return res.status(403).json({ error: 'Access denied' });
      const exists = fs.existsSync(filePath);
      res.json({ exists });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/file', (req: any, res: any) => {
    const { path: filePath, content } = req.body;
    try {
      if (!isPathAllowed(filePath)) return res.status(403).json({ error: 'Access denied' });
      const backupPath = `${filePath}.backup`;
      if (fs.existsSync(filePath)) fs.copyFileSync(filePath, backupPath);
      fs.writeFileSync(filePath, content, 'utf-8');
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/file/restore', (req: any, res: any) => {
    const { path: filePath } = req.body;
    try {
      if (!isPathAllowed(filePath)) return res.status(403).json({ error: 'Access denied' });
      const backupPath = `${filePath}.backup`;
      if (!fs.existsSync(backupPath)) return res.status(404).json({ error: 'Backup not found' });
      fs.copyFileSync(backupPath, filePath);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

function isPathAllowed(filePath: string): boolean {
  const allowed = ['/home/deck/.config/SLSsteam/', '/home/deck/.steam/steam/compatibilitytools.d/sls/'];
  return allowed.some(p => filePath.startsWith(p));
}
