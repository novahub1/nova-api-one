// api/animals-test.js
// API DE TESTE - NÃO DELETA NADA (guarda tudo)

let animalsData = [];

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
    
    // POST - Receber animal (SEM DELETAR NADA)
    if (req.method === 'POST') {
        try {
            const { animal } = req.body;
            
            if (!animal || !animal.name || !animal.generation || !animal.jobId) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados inválidos'
                });
            }
            
            // Adiciona com timestamp mas NÃO DELETA
            animalsData.push({
                ...animal,
                timestamp: Date.now(),
                receivedAt: new Date().toISOString()
            });
            
            console.log('Pet recebido:', animal.name, animal.generation);
            
            return res.status(200).json({
                success: true,
                message: 'Animal recebido com sucesso',
                data: animal,
                totalAnimals: animalsData.length
            });
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // GET - Retornar todos (NUNCA DELETA)
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            totalAnimals: animalsData.length,
            animals: animalsData,
            info: {
                message: "API DE TESTE - Dados nunca são deletados",
                currentTime: new Date().toISOString()
            }
        });
    }
    
    // DELETE - Limpar tudo manualmente
    if (req.method === 'DELETE') {
        const count = animalsData.length;
        animalsData = [];
        return res.status(200).json({
            success: true,
            message: `${count} animais deletados`,
            totalAnimals: 0
        });
    }
    
    return res.status(405).json({
        success: false,
        error: 'Método não permitido'
    });
}
