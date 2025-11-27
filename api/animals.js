// api/animals-test.js
// API com limpeza por servidor

let animalsData = [];

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
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
            
            // Adiciona os dados
            animalsData.push({
                jobId: animal.jobId,
                name: animal.name,
                generation: animal.generation
            });
            
            console.log('Pet recebido:', animal.name, animal.generation);
            
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
    
    // DELETE - Limpar pets de um servidor específico
    if (req.method === 'DELETE') {
        try {
            const { jobId } = req.body;
            
            if (!jobId) {
                return res.status(400).json({
                    success: false,
                    error: 'jobId é obrigatório'
                });
            }
            
            // Remove apenas os pets do servidor especificado
            const countBefore = animalsData.length;
            animalsData = animalsData.filter(item => item.jobId !== jobId);
            const countAfter = animalsData.length;
            const deleted = countBefore - countAfter;
            
            console.log(`Servidor ${jobId} limpo: ${deleted} pets removidos`);
            
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
        return res.status(200).json({
            animals: animalsData
        });
    }
    
    return res.status(405).json({
        success: false,
        error: 'Método não permitido'
    });
}
