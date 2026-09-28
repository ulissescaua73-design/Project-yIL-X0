const { GoogleGenAI } = require('@google/genai');

// Inicializa a IA com a tua API Key do Google AI Studio
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

module.exports = (client) => {
    client.on('messageCreate', async message => {
        // Ignora mensagens de outros bots ou do próprio bot
        if (message.author.bot) return;

        // Verifica se o bot foi mencionado na mensagem
        if (!message.mentions.has(client.user)) return;

        try {
            // Mostra o status de "a escrever..." no chat do Discord
            await message.channel.sendTyping();

            // Limpa a menção da mensagem para enviar apenas o texto da pergunta para a IA
            const prompt = message.content
                .replace(`<@!${client.user.id}>`, '')
                .replace(`<@${client.user.id}>`, '')
                .trim();

            if (!prompt) {
                await message.reply('Eae! Mandou a menção mas esqueceu do texto. Manda a boa, chefe ⚡');
                return;
            }

          // Envia o prompt para o Gemini com o modelo atualizado exigido pela API
            const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
                config: {
                    systemInstruction: 'És a inteligência artificial oficial e cibernética deste servidor de Discord. Tens uma personalidade tech, urbana, prestativa, fala em português brasileiro de forma informal, direta e com estilo urbano, com gírias de rua de São Paulo como "parça, truta e etc". Seja prestativo e legal com os membros, pode ser mais malandro também e brincalhao, tendo uma personalide daora e admiravel do jeitao brasileiro. Seja irado e descolado.'
                }
            });

            // Responde diretamente à mensagem do usuário no Discord
            await message.reply(response.text);

        } catch (err) {
            console.error('Erro ao comunicar com a IA:', err);
            await message.reply('❌ Deu ruim aqui nos meus circuitos quânticos... Tenta de novo mais tarde!');
        }
    });
};