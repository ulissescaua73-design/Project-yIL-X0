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

    // 1. Enviar painel de FastFlags
    try {
        const canalFflag = await client.channels.fetch(ID_CANAL_FFLAG);
        if (canalFflag) {
            const embedFflag = new EmbedBuilder()
                .setColor('#00ffcc')
                .setTitle('⚡ GERADOR DE FASTFLAGS // IA')
                .setDescription('Clica no menu abaixo para pedir as tuas FastFlags personalizadas geradas por inteligência artificial (Groq).');

            const rowFflag = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('painel_fflag_menu')
                        .setPlaceholder('⚙️ Clica aqui para configurar as tuas Fflags...')
                        .addOptions([
                            {
                                label: 'Gerar Fflag Personalizada',
                                description: 'Escreve o teu objetivo e a IA gera o JSON otimizado.',
                                value: 'fflag_opcao',
                                emoji: '⚡'
                            }
                        ])
                );

            await canalFflag.send({ embeds: [embedFflag], components: [rowFflag] });
            console.log('Painel de FastFlags enviado com sucesso!');
        }
    } catch (err) {
        console.error('Erro ao enviar painel de Fflags:', err);
    }

    // 2. Enviar painel de Executores
    try {
        const canalExecutor = await client.channels.fetch(ID_CANAL_EXECUTOR);
        if (canalExecutor) {
            const embedExecutor = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🚀 EXECUTORES E FERRAMENTAS // yIL')
                .setDescription('Seleciona abaixo para descarregar os executores e ferramentas de forma segura.');

            const rowExecutor = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('painel_executor_menu')
                        .setPlaceholder('📥 Seleciona o menu de downloads...')
                        .addOptions([
                            {
                                label: 'Baixar Executores',
                                description: 'Abre o menu de downloads dos programas.',
                                value: 'executor_opcao',
                                emoji: '🚀'
                            }
                        ])
                );

            await canalExecutor.send({ embeds: [embedExecutor], components: [rowExecutor] });
            console.log('Painel de Executores enviado com sucesso!');
        }
    } catch (err) {
        console.error('Erro ao enviar painel de executores:', err);
    }
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