const OpenAI = require('openai');

async function gerarFastFlagGroq(userPrompt) {
    const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: '[https://api.groq.com/openai/v1](https://api.groq.com/openai/v1)'
    });

    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: "És um engenheiro reverso sénior do motor do Roblox e um criador especialista de FastFlags (FFlags). Quando o utilizador pedir otimizações (como FPS máximo, tirar texturas, melhorar latência, física ou gráficos), deves gerar um objeto JSON rico e detalhado contendo VÁRIAS FastFlags reais e avançadas do Roblox aplicáveis (por exemplo, flags de limitação de FPS, remoção de sombras/texturas, otimização de rede e task scheduler). Nunca devolvas apenas uma flag genérica ou de uma linha só. Devolve um JSON estruturado com várias chaves e valores técnicos válidos. NÃO escrevas introduções, conversas ou markdown extra. Retorna APENAS o objeto JSON puro."
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.3,
            max_tokens: 1500
        });

        let resposta = completion.choices[0].message.content.trim();

        // Remove blocos de markdown caso a IA coloque por engano
        resposta = resposta.replace(/^```json\s*/i, '');
        resposta = resposta.replace(/^```\s*/i, '');
        resposta = resposta.replace(/\s*```$/, '');

        return resposta.trim();
    } catch (error) {
        console.error("Erro ao comunicar com a Groq API:", error);
        throw new Error("O sistema de otimização está indisponível de momento.");
    }
}

module.exports = { gerarFastFlagGroq };