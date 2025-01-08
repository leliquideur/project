import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// Configurer CORS pour autoriser les requêtes depuis le frontend
app.use(cors({
  origin: "http://localhost:5173", // Remplacez par l'URL de votre frontend si différente
}));
//*/
const apiKey = process.env.SENDGRID_API_KEY;
const toEmail =process.env.EMAIL_TEST;
const fromEmail = process.env.EMAIL_SUPABASE;
const date = new Date().toLocaleString();


if (!apiKey || !toEmail || !fromEmail) {
  throw new Error("Les variables d'environnement SENDGRID_API_KEY, EMAIL_TEST ou EMAIL_SUPABASE ne sont pas définies");
}

sgMail.setApiKey(apiKey);

app.post("/api/send-email", async (_req, res) => {
  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: "Test d'envoi avec SendGrid ",
    text: `Ceci est un email dazeazeazee test. ${date}`,
    html: "<strong>Ceci est un email de test.</strong>",
  };

  try {
    await sgMail.send(msg);
    console.log("Email envoyé");
    res.status(200).send("Email envoyé");
  } catch (error: any) {
    console.error("Erreur SendGrid:", error.response ? error.response.body : error);
    res.status(500).send("Erreur lors de l'envoi de l'email");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur backend en cours d'exécution sur le port ${PORT}`);
});