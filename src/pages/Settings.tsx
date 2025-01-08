import React, { useState } from "react";

export function Settings() {
  const sendEmail = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        console.log("Email envoyé avec succès !");
      } else {
        alert("Échec de l'envoi de l'email.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi de l'email.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      Settings
      <button
        onClick={sendEmail}
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Envoyer un Email
      </button>
    </div>
  );
}
