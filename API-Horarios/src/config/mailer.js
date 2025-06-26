const nodemailer = require('nodemailer');

// Configuración del "Transportador" de Correos.
// En un proyecto real, estas credenciales deberían estar en variables de entorno.
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Puerto 465 para SSL
    secure: true,
    auth: {
        // IMPORTANTE: Reemplaza con tus credenciales.
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// Se exporta una función para enviar correos, para que sea fácil de usar.
const sendEmail = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo enviado a: ${mailOptions.to}`);
    } catch (error) {
        console.error(`Error al enviar correo a ${mailOptions.to}:`, error);
        // No lanzamos un error para no detener el flujo principal (ej: el usuario se crea igual)
    }
};

module.exports = { sendEmail };
