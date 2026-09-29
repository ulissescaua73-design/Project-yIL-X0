const OpenAI = require('openai');

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

async function gerarFastFlagGroq(userPrompt) {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "És um gerador estrito e avançado de FastFlags para Roblox. O teu único objetivo é retornar um objeto JSON válido contendo as flags otimizadas com base no pedido do utilizador. NÃO escrevas NENHUM texto explicativo, introduções ou conversas. Retorna APENAS o bloco de código JSON puro."
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.2,
            max_tokens: 1024
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("Erro ao comunicar com a Groq API:", error);
        throw new Error("O sistema de otimização está indisponível de momento.");
    }
}

module.exports = { gerarFastFlagGroq };