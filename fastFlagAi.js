const OpenAI = require('openai');

async function gerarFastFlagGroq(userPrompt) {
    const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
    });

    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: `És um engenheiro reverso sénior do Roblox especialista em FastFlags (FFlags) para o Bloxstrap. 
O teu único objetivo é retornar um objeto JSON plano (flat JSON) contendo FFlags reais e válidas do Roblox com base no pedido do utilizador.

REGRAS ESTRITAS:
1. Retorna APENAS o objeto JSON puro contendo as FFlags.
2. Cada chave DEVE começar com os prefixos corretos do Roblox (como FFlag, DFInt, DFFlag, FString).
3. Os valores devem ser diretamente os valores (booleanos, números ou strings), NUNCA cries estruturas aninhadas com "Value" ou "Type".

Exemplo correto:
{
  "FFlagTaskSchedulerLimitTargetFps": true,
  "DFIntTaskSchedulerTargetFps": 240,
  "FFlagDebugGraphicsDisableDirectX11": false
}`
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.2,
            max_tokens: 1500
        });

        let resposta = completion.choices[0].message.content.trim();

        // Encontra o bloco JSON real dentro da resposta (desde a primeira '{' até à última '}')
        const inicioJson = resposta.indexOf('{');
        const fimJson = resposta.lastIndexOf('}');

        if (inicioJson !== -1 && fimJson !== -1 && fimJson > inicioJson) {
            resposta = resposta.substring(inicioJson, fimJson + 1);
        }

        return resposta.trim();
    } catch (error) {
        console.error("Erro ao comunicar com a Groq API:", error);
        throw new Error("O sistema de otimização está indisponível de momento.");
    }
}

module.exports = { gerarFastFlagGroq };