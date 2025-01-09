import { createClient } from '@supabase/supabase-js';
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

// ...existing code...
router.post("/post-comment-reply-and-notify", async (req, res) => {
    const { ticketId, replyContent, userId } = req.body;
    console.log("Nouveau commentaire sur le ticket", ticketId, "par l'utilisateur", userId, ":", replyContent);
  
  try {
    console.log("Nouveau commentaire sur le ticket", ticketId, "par l'utilisateur", userId);
    // 1. Sauvegarder le commentaire
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([
        { ticket_id: ticketId, content: replyContent, created_by: userId }
      ]);
    console.log("Commentaire enregistré:", comment);
    if (commentError) throw new Error(commentError.message);

    // 2. Récupérer le ticket et ses informations
    console.log("Récupération du ticket", ticketId);
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*, assigned_to')
      .eq('id', ticketId)
      .single();
    console.log("Ticket récupéré:", ticket);
    if (ticketError) throw new Error(ticketError.message);

    console.log("Utilisateur assigné:", ticket.assigned_to);
    // 3. Vérifier si l'utilisateur est admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('is_admin, email')
      .eq('id', userId)
      .single();
    console.log("Utilisateur actuel:", currentUser);
    if (userError) throw new Error(userError.message);

      console.log("Utilisateur actuel:", currentUser);
    // 4. Préparer l'email
    const emailSubject = `Nouveau commentaire sur le ticket #${ticketId}`;
    const emailContent = `
      <h2>Nouveau commentaire sur le ticket</h2>
      <p>${replyContent}</p>
      <p>Pour voir le ticket, <a href="${process.env.FRONTEND_URL}/tickets/${ticketId}">cliquez ici</a></p>
    `;
    console.log("Email prêt à être envoyé");

    // 5. Logique d'envoi des emails
    if (ticket.assigned_to) {
      // Envoyer à l'utilisateur assigné
      console.log("Envoi de l'email à l'utilisateur assigné", ticket.assigned_to, ":", emailContent);
      const { data: assignedUser } = await supabase
        .from('users')
        .select('email')
        .eq('id', ticket.assigned_to)
        .single();

      await sgMail.send({
        to: assignedUser.email,
        from: process.env.FROM_EMAIL,
        subject: emailSubject,
        html: emailContent
      });
    } else {
        console.log("Aucun utilisateur assigné");
      // Envoyer à tous les admins
      const { data: admins } = await supabase
        .from('users')
        .select('email')
        .eq('is_admin', true);
        console.log("Admins récupérés:", admins,    ":", emailContent);
      const adminEmails = admins.map(admin => admin.email);
      
      await sgMail.send({
        to: adminEmails,
        from: process.env.FROM_EMAIL,
        subject: emailSubject,
        html: emailContent
      });
    }

    // Si c'est un admin qui répond, notifier tous les abonnés
    if (currentUser.is_admin) {
      const { data: subscribers } = await supabase
        .from('ticket_subscribers')
        .select('users(email)')
        .eq('ticket_id', ticketId);

      const subscriberEmails = subscribers.map(sub => sub.users.email);
      
      await sgMail.send({
        to: subscriberEmails,
        from: process.env.FROM_EMAIL,
        subject: `Réponse d'un administrateur - Ticket #${ticketId}`,
        html: emailContent
      });
    }

    return res.status(200).send("Réponse enregistrée et notifications envoyées");
  } catch (error) {
    console.error("Erreur:", error);
    return res.status(500).send("Erreur serveur: " + error.message);
  }
});

module.exports = router;
// ...existing code...