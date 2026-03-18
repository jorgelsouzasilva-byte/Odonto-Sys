
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import jwt from "jsonwebtoken";

const JWT_SECRET = "super-secret-key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Login Endpoint
  app.post("/api/auth/login", (req, res) => {
    const { email, senha } = req.body;
    
    // Simple mock validation
    if (email === "jorge@clinica.com" && senha === "123456") {
      const user = {
        id: 1,
        nome: "Jorge",
        email: "jorge@clinica.com",
        unidades: [1],
        roles: ["admin_unidade"],
        permissoes: ["orcamentos.view", "orcamentos.create"]
      };
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      
      return res.json({
        token,
        user
      });
    }

    return res.status(401).json({ message: "Credenciais inválidas" });
  });

  // Mock Forgot Password Endpoint
  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    // In a real app, send an email here
    console.log(`Recuperação de senha solicitada para: ${email}`);
    res.json({ message: "Se o email existir, enviaremos um link de recuperação." });
  });

  // Mock Reset Password Endpoint
  app.post("/api/auth/reset-password", (req, res) => {
    const { token, nova_senha, confirmar_senha } = req.body;
    if (nova_senha !== confirmar_senha) {
      return res.status(400).json({ message: "Senhas não conferem" });
    }
    // In a real app, verify the token and update the password
    res.json({ message: "Senha redefinida com sucesso." });
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
