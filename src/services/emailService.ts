import axios from 'axios';

export const sendEmail = async (to: string[], subject: string, text: string, html: string) => {
    try {
        console.log('Envoi de l\'email');
        const response = await axios.post('http://localhost:PORT/api/send-email', {
            to,
            subject,
            text,
            html,
        });
        console.log('Email envoyé avec succès', response.data);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email', error);
    }
};

export const postCommentReplyAndNotify = async (ticketId: string, replyContent: string, userId: string) => {
    try {
        console.log('Envoi du commentaire');
        const response = await fetch('http://localhost:5000/api/post-comment-reply-and-notify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ticketId,
            replyContent,
            userId
        })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi du commentaire');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

