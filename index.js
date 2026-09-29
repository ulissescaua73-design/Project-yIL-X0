const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Importações dos outros sistemas
const welcomeSystem = require('./welcome.js');
welcomeSystem(client);

const aiChatSystem = require('./aiChat.js');
aiChatSystem(client);

const moderationSystem = require('./moderation.js');
moderationSystem(client);

// Importa a função da Groq
const { gerarFastFlagGroq } = require('./fastFlagAi.js');

// IDs dos canais
const ID_CANAL_FFLAG = '1554225648770482216';
const ID_CANAL_EXECUTOR = '1554591514099851375';

client.once('ready', async () => {
    console.log(`Bot online e com muita aura! Logado como ${client.user.tag}`);
});

// Evento de Interações
client.on('interactionCreate', async interaction => {
    
    // 1. Menus de Seleção
    if (interaction.isStringSelectMenu()) {
        
        // Menu de FastFlags
        if (interaction.customId === 'painel_fflag_menu') {
            const escolha = interaction.values[0];

            if (escolha === 'fflag_opcao') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_fastflag')
                    .setTitle('Configurador de FastFlags (Groq IA)');

                const input = new TextInputBuilder()
                    .setCustomId('prompt_ff')
                    .setLabel('O que pretendes otimizar no Roblox?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Ex: Quero o máximo de FPS possível, remover texturas pesadas e manter o ping estável.')
                    .setRequired(true);

                const row = new ActionRowBuilder().addComponents(input);
                modal.addComponents(row);

                await interaction.showModal(modal);
            }
        }

        // Menu de Executores
        if (interaction.customId === 'painel_executor_menu') {
            const escolha = interaction.values[0];

            if (escolha === 'executor_opcao') {
                await interaction.deferReply({ ephemeral: true });

                try {
                    await interaction.followUp({
                        content: '📥 **Executores e Ferramentas Disponíveis:** Aqui estão os arquivos solicitados de forma segura:',
                        files: ['./FFM_Installer.exe', './Velostrap (1) (1).exe'],
                        ephemeral: true
                    });
                } catch (err) {
                    console.error('Erro ao enviar arquivos:', err);
                    await interaction.followUp({
                        content: '❌ Ocorreu um erro ao tentar enviar os arquivos. Verifique se eles estão na pasta correta.',
                        ephemeral: true
                    });
                }
            }
        }
    }

    // 2. Submissão do Modal das FastFlags
    if (interaction.isModalSubmit() && interaction.customId === 'modal_fastflag') {
        await interaction.deferReply({ ephemeral: true });

        const userInput = interaction.fields.getTextInputValue('prompt_ff');

        try {
            const jsonResult = await gerarFastFlagGroq(userInput);

            await interaction.editReply({
                content: `⚡ **FastFlags Personalizadas Geradas com Sucesso:**\n\`\`\`json\n${jsonResult}\n\`\`\``
            });
        } catch (error) {
            console.error('Erro ao gerar FastFlags via Groq:', error);
            await interaction.editReply({
                content: '❌ Ocorreu um erro ao gerar as FastFlags com a IA. Tenta novamente em instantes!'
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot do Discord está online!');
});

app.listen(PORT, () => {
  console.log(`Servidor web rodando na porta ${PORT}`);
});