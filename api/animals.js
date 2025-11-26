// api/animals.js
// ========================================
// API para receber e armazenar pets do Roblox
// Auto-deleta dados após 3 segundos
// ========================================

// Armazena os dados em memória (se precisar persistência, use banco de dados)
let animalsData = [];

// Função para limpar dados antigos (mais de 3 segundos)
function cleanOldData() {
    const now = Date.now();
    const THREE_SECONDS = 3000;
    
    // Filtra apenas dados que têm menos de 3 segundos
    animalsData = animalsData.filter(item => {
        const age = now - item.timestamp;
        return age < THREE_SECONDS;
    });
}

// Função para adicionar novo animal
function addAnimal(animalData) {
    animalsData.push({
        ...animalData,
        timestamp: Date.now() // Adiciona timestamp de quando foi recebido
    });
}

// Handler principal da API
export default function handler(req, res) {
    // Configurar CORS para aceitar requisições do Roblox
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Responder OPTIONS para CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Limpar dados antigos antes de processar qualquer requisição
    cleanOldData();
    
    // ========================================
    // POST - Receber novo animal
    // ========================================
    if (req.method === 'POST') {
        try {
            const { animal } = req.body;
            
            // Validar dados recebidos
            if (!animal || !animal.name || !animal.generation || !animal.jobId) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados inválidos. Necessário: animal.name, animal.generation, animal.jobId'
                });
            }
            
            // Adicionar animal com timestamp
            addAnimal(animal);
            
            return res.status(200).json({
                success: true,
                message: 'Animal recebido com sucesso',
                data: {
                    name: animal.name,
                    generation: animal.generation,
                    jobId: animal.jobId,
                    receivedAt: new Date().toISOString()
                },
                totalAnimals: animalsData.length
            });
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Erro ao processar dados',
                details: error.message
            });
        }
    }
    
    // ========================================
    // GET - Retornar todos os animais ativos
    // ========================================
    if (req.method === 'GET') {
        const now = Date.now();
        
        // Adicionar informação de "idade" em cada animal
        const animalsWithAge = animalsData.map(item => {
            const ageInSeconds = ((now - item.timestamp) / 1000).toFixed(2);
            const timeRemaining = (3 - parseFloat(ageInSeconds)).toFixed(2);
            
            return {
                name: item.name,
                generation: item.generation,
                jobId: item.jobId,
                ageInSeconds: parseFloat(ageInSeconds),
                timeRemainingSeconds: Math.max(0, parseFloat(timeRemaining)),
                receivedAt: new Date(item.timestamp).toISOString()
            };
        });
        
        // Agrupar por jobId para melhor visualização
        const groupedByJob = {};
        animalsWithAge.forEach(animal => {
            if (!groupedByJob[animal.jobId]) {
                groupedByJob[animal.jobId] = [];
            }
            groupedByJob[animal.jobId].push(animal);
        });
        
        return res.status(200).json({
            success: true,
            totalAnimals: animalsData.length,
            totalServers: Object.keys(groupedByJob).length,
            animals: animalsWithAge,
            groupedByServer: groupedByJob,
            info: {
                autoDeleteAfter: '3 seconds',
                currentTime: new Date().toISOString()
            }
        });
    }
    
    // ========================================
    // Método não permitido
    // ========================================
    return res.status(405).json({
        success: false,
        error: 'Método não permitido. Use GET ou POST'
    });
}