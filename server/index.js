const express = require('express');
const cors = require('cors');
const app = express();

// Configuration de base
app.use(cors());
app.use(express.json());

// Import des routes
const ticketController = require('./ticketController');

// Utilisation des routes
app.use('/api', ticketController);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});