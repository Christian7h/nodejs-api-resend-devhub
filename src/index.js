// src/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { Resend } = require("resend");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY || "re_Pqb8UoBd_dGD8TF67gEh4Mfez9WF7A9f7");

app.post("/api/send-email", async (req, res) => {
  try {
    const { nombre, celular, email, asunto, mensaje, servicios } = req.body;
    
    if (!nombre || !celular || !email || (!asunto && !servicios) || !mensaje) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }
    
    const celularRegex = /^(\+?56)?9\d{8}$/;
    if (!celularRegex.test(celular)) {
      return res.status(400).json({ error: "Formato de celular chileno inválido" });
    }

    let asuntoCorreo = "";
    let serviciosHtml = "";
    
    if (servicios && Array.isArray(servicios) && servicios.length > 0) {
      asuntoCorreo = `Solicitud de servicios: ${servicios.join(", ")}`;
      
      serviciosHtml = `
        <h3>Servicios solicitados:</h3>
        <ul>
          ${servicios.map(servicio => `<li>${servicio}</li>`).join("")}
        </ul>
      `;
    } else if (asunto) {
      asuntoCorreo = `Nuevo contacto: ${asunto}`;
    } else {
      asuntoCorreo = "Nuevo contacto desde el formulario web";
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background-color: #4a6fa5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .info-item { margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .info-label { font-weight: bold; color: #4a6fa5; }
        .message-section { background-color: white; padding: 15px; border-left: 4px solid #4a6fa5; margin-top: 20px; }
        .footer { font-size: 12px; text-align: center; padding: 10px; color: #777; }
      </style>
      </head>
      <body>
      <div class="header">
        <h1>Nuevo Mensaje de Contacto</h1>
      </div>
      <div class="content">
        <div class="info-item"><span class="info-label">Nombre:</span> ${nombre}</div>
        <div class="info-item"><span class="info-label">Celular:</span> ${celular}</div>
        <div class="info-item"><span class="info-label">Email:</span> ${email}</div>
        ${asunto ? `<div class="info-item"><span class="info-label">Asunto:</span> ${asunto}</div>` : ''}
        ${serviciosHtml}
        <div class="message-section">
        <h3>Mensaje:</h3>
        <p>${mensaje}</p>
        </div>
      </div>
      <div class="footer">
        <p>Este mensaje fue enviado desde el formulario de contacto del sitio web.</p>
      </div>
      </body>
      </html>
    `;

    const to = process.env.EMAIL_TO || "tu-correo@ejemplo.com";

    const response = await resend.emails.send({
      from: "Formulario de Contacto <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: asuntoCorreo,
      html: htmlTemplate,
    });

    console.log("Email enviado correctamente:", response);
    res.status(200).json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar email:", error.message);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});