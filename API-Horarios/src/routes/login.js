const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');
const { sendEmail } = require('../config/mailer');

// POST 
// Inicia sesión de un usuario usando el sistema de Auth de Supabase.
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'El correo y la contraseña son requeridos.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        return res.status(401).json({ error: 'Credenciales inválidas.', details: error.message });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso', ...data });
});

// POST 
// Inicia el flujo para restablecer la contraseña de un usuario usando Nodemailer.
router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido.' });
    }

    try {
        // 2. Se genera un enlace de un solo uso SIN que Supabase envíe el correo.
        // se usa el método de admin para tener más control.
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: email,
        });

        if (error) {
            // No se revela si el correo existe o no por seguridad, pero sí registramos el fallo.
            console.error("Error al generar enlace de reseteo:", error.message);
            // Se devuelve siempre una respuesta genérica exitosa.
            return res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.' });
        }
        
        const resetLink = data.properties.action_link;

        // 3. Ahora, se envia el enlace usando el servicio de correo.
        const mailOptions = {
            from: `"Sistema de Graduados" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Restablece tu contraseña para el Portal de Graduados',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Restablecimiento de Contraseña</h2>
                    <p>¡Hola!</p>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no has sido tú, puedes ignorar este correo.</p>
                    <p>Para continuar, por favor haz clic en el siguiente enlace:</p>
                    <p style="text-align: center;">
                        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Restablecer Contraseña
                        </a>
                    </p>
                    <p>Este enlace es válido por un tiempo limitado.</p>
                    <p>Saludos cordiales,<br>El Equipo del Portal de Graduados</p>
                </div>
            `,
        };

        await sendEmail(mailOptions);

        // 4. Se enviamos la respuesta genérica al usuario.
        res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.' });

    } catch (error) {
        console.error("Error en el proceso de restablecer contraseña:", error.message);
        // Se envia una respuesta genérica incluso si el servicio de correo falla, por seguridad.
        res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.' });
    }
});

module.exports = router;
