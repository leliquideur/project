var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Validation des variables d'environnement
const requiredEnvVars = {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    EMAIL_SUPABASE: process.env.VITE_EMAIL_SUPABASE
};

Object.entries(requiredEnvVars).forEach(([name, value]) => {
    if (!value) throw new Error(`Variable d'environnement manquante: ${name}`);
});

// Configuration Supabase
const supabase = createClient(
    requiredEnvVars.SUPABASE_URL,
    requiredEnvVars.SUPABASE_ANON_KEY
);

const app = express();
app.use(express.json());
app.use(cors());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Route pour l'envoi des commentaires
app.post("/api/post-comment-reply-and-notify", async (req, res) => {
    try {
        const { ticketId, replyContent, userId } = req.body;
        
        if (!ticketId || !replyContent || !userId) {
            return res.status(400).json({ 
                error: "Données manquantes",
                details: "ticketId, replyContent et userId sont requis" 
            });
        }

        const { data: comment, error: commentError } = await supabase
            .from('comments')
            .insert([{ 
                ticket_id: ticketId, 
                content: replyContent,
                created_by: userId 
            }])
            .select()
            .single();

        if (commentError) throw commentError;

        // Notification par email
        const msg = {
            to: process.env.EMAIL_TEST,
            from: process.env.EMAIL_SUPABASE,
            subject: `Nouveau commentaire - Ticket #${ticketId}`,
            text: replyContent,
            html: `<p>${replyContent}</p>`
        };

        await sgMail.send(msg);

        res.status(200).json({
            success: true,
            message: "Commentaire enregistré et notification envoyée",
            data: comment
        });

    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({
            error: "Erreur serveur",
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
