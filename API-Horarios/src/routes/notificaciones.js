const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient');
// 1. Se importa la función para enviar correos
const { sendEmail } = require('../config/mailer');

/**
 * Función auxiliar para obtener los datos del taller y la lista de destinatarios.
 * Esto mantiene la ruta principal más limpia y legible.
 * @param {string} taller_id - El ID del taller.
 * @returns {Promise<{tallerData: object, destinatarios: object[]}>}
 */
async function getTallerAndRecipients(taller_id) {
    if (!taller_id) {
        throw new Error('Se requiere el ID del taller.');
    }

    // Obtener detalles del taller y sus áreas de interés
    const { data: tallerData, error: tallerError } = await supabase
        .from('talleres')
        .select(`nombre, descripcion, fecha_inicio, talleres_areas_interes(areas_interes(id))`)
        .eq('id', taller_id)
        .single();
    if (tallerError) {
        throw new Error('No se pudo encontrar el taller.');
    }

    const areaIds = tallerData.talleres_areas_interes.map(item => item.areas_interes.id);
    if (areaIds.length === 0) {
        return { tallerData, destinatarios: [] }; // Devuelve una lista vacía si no hay áreas
    }

    // Encontrar graduados interesados que coincidan con las áreas
    const { data: graduadosInteresados, error: graduadosError } = await supabase
        .from('graduados_areas_interes')
        .select(`graduados(correo_electronico, nombre_completo)`)
        .in('area_interes_id', areaIds);
    if (graduadosError) {
        throw new Error('Error al buscar graduados.');
    }

    // Eliminar duplicados para no enviar el mismo correo varias veces a un usuario
    const destinatarios = [...new Map(graduadosInteresados.map(item => [item.graduados.correo_electronico, item.graduados])).values()];

    return { tallerData, destinatarios };
}


// --- POST 
router.post('/taller', async (req, res) => {
    try {
        // 2. Se usa la función auxiliar para obtener los datos
        const { tallerData, destinatarios } = await getTallerAndRecipients(req.body.taller_id);

        if (destinatarios.length === 0) {
            return res.status(200).json({ message: 'No se encontraron graduados interesados para notificar.' });
        }

        // 3. Bucle para enviar correos usando el nuevo módulo
        for (const graduado of destinatarios) {
            const mailOptions = {
                from: '"Sistema de Graduados" <arenwind02@gmail.com>',
                to: graduado.correo_electronico,
                subject: `¡Nuevo taller de tu interés: ${tallerData.nombre}!`,
                html: `
                    <h2>¡Hola, ${graduado.nombre_completo}!</h2>
                    <p>Te contactamos porque hemos abierto inscripciones para un nuevo taller que podría interesarte, basado en tus preferencias.</p>
                    <h3>${tallerData.nombre}</h3>
                    <p>
                      <strong>Descripción:</strong> ${tallerData.descripcion}<br>
                      <strong>Fecha de Inicio:</strong> ${new Date(tallerData.fecha_inicio).toLocaleDateString('es-CR')}
                    </p>
                    <p>¡No te quedes sin tu espacio! Puedes inscribirte visitando nuestro portal.</p>
                    <p>Saludos cordiales,<br>El Equipo de Graduados</p>
                `,
            };

            // 4. Se usa la función centralizada para enviar el correo
            sendEmail(mailOptions);

            // Pausa para no saturar el servidor de correo
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        res.status(200).json({ message: `Se procesaron notificaciones para ${destinatarios.length} graduados.` });

    } catch (error) {
        console.error("Error en la ruta de notificaciones:", error);
        res.status(500).json({ error: 'Ocurrió un error en el servidor.', details: error.message });
    }
});

module.exports = router;
