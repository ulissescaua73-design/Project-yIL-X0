const { GoogleGenAI } = require('@google/genai');

// Usa a mesma inicialização que já tens no teu bot
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function gerarFastFlagGroq(userPrompt) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash', // Mantém o modelo que já usas no bot
            contents: `Gera um objeto JSON plano contendo FFlags reais, válidas e avançadas do Roblox (como FFlag..., DFInt..., etc.) para o Bloxstrap, com base no seguinte pedido do utilizador: "${userPrompt}". 
            
REGRAS:
1. Devolve APENAS o JSON válido. 
2. Nao uses estruturas aninhadas com "Value" ou "Type". Usa formato chave-valor direto.
3. Exemplo: {"FFlagTaskSchedulerLimitTargetFps": true, "DFIntTaskSchedulerTargetFps": 240}`,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.2
            }
        });

        let resposta = response.text ? response.text.trim() : '';

        // Limpeza de segurança para isolar o JSON
        const inicioJson = resposta.indexOf('{');
        const fimJson = resposta.lastIndexOf('}');

        if (inicioJson !== -1 && fimJson !== -1 && fimJson > inicioJson) {
            resposta = resposta.substring(inicioJson, fimJson + 1);
        }

        return resposta.trim();
    } catch (error) {
        console.error("Erro ao comunicar com a API do Gemini:", error);
        throw new Error("O sistema de otimização está indisponível de momento.");
    }
}

module.exports = { gerarFastFlagGroq };