// api/animals-test.js
// API com auto-delete após 3 segundos

let animalsData = [];

// Função para limpar dados antigos (mais de 3 segundos)
function cleanOldData() {
    const now = Date.now();
    const THREE_SECONDS = 3000;
    
    animalsData = animalsData.filter(item => {
        const age = now - item.timestamp;
        return age < THREE_SECONDS;
    });
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Limpar dados antigos antes de qualquer operação
    cleanOldData();
    
    // POST - Receber animal
    if (req.method === 'POST') {
        try {
            const { animal } = req.body;
            
            if (!animal || !animal.name || !animal.generation || !animal.jobId) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados inválidos'
                });
            }
            
            // Adiciona com timestamp para controle de deleção
            animalsData.push({
                jobId: animal.jobId,
                name: animal.name,
                generation: animal.generation,
                timestamp: Date.now() // Usado apenas internamente para deletar
            });
            
            console.log('Pet recebido:', animal.name, animal.generation);
            
            // Resposta minimalista
            return res.status(200).json({
                animal: null
            });
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // GET - Retornar todos
    if (req.method === 'GET') {
        // Remove timestamp antes de retornar
        const cleanAnimals = animalsData.map(item => ({
            jobId: item.jobId,
            name: item.name,
            generation: item.generation
        }));
        
        return res.status(200).json({
            animals: cleanAnimals
        });
    }
    
    // DELETE - Limpar tudo manualmente
    if (req.method === 'DELETE') {
        animalsData = [];
        return res.status(200).json({
            animal: null
        });
    }
    
    return res.status(405).json({
        success: false,
        error: 'Método não permitido'
    });
}
