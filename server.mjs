import express from 'express';
import cors from 'cors';
import { Ollama } from 'ollama';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas para servir el Frontend de forma estática
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); 
app.use(express.json());

// Ruta GET para la raíz: Sirve tu archivo index.html automáticamente al entrar al enlace
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const ollama = new Ollama({ host: 'http://localhost:11434' });

app.post('/api/tutor', async (req, res) => {
    try {
        const { historialMensajes } = req.body;

        const systemPrompt = {
            role: 'system',
            content: `Eres un tutor de programación experto, paciente y amigable. 
            Tu objetivo es guiar al estudiante. REGLA CRÍTICA: Nunca le des el código de la solución resuelto directamente. 
            Si el usuario comete un error, explícale la lógica detrás del error y hazle preguntas guía para que él mismo lo descubra.`
        };

        const mensajesCompletos = [systemPrompt, ...historialMensajes];

        const respuestaIA = await ollama.chat({
            model: 'qwen2.5-coder:7b',
            messages: mensajesCompletos,
            stream: false 
        });

        res.json({ respuesta: respuestaIA.message.content });

    } catch (error) {
        console.error('Error en el servidor de IA:', error);
        res.status(500).json({ error: 'Hubo un problema al procesar la respuesta del tutor.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor de tutoría corriendo en http://localhost:${PORT}`));