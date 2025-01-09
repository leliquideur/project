import axios from 'axios';

export const sendEmail = async (to: string[], subject: string, text: string, html: string) => {
    try {
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

