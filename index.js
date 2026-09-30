const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

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

    // 1. Enviar painel de FastFlags (com Botão)
    try {
        const canalFflag = await client.channels.fetch(ID_CANAL_FFLAG);
        if (canalFflag) {
            const embedFflag = new EmbedBuilder()
                .setColor('#00ffcc')
                .setTitle('⚡ GERADOR DE FASTFLAGS // IA')
                .setDescription('Clica no botão abaixo para pedir as tuas FastFlags personalizadas geradas por inteligência artificial (Groq).');

            const botaoFflag = new ButtonBuilder()
                .setCustomId('btn_gerar_fflag')
                .setLabel('Gerar Fflag')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚡');

            const rowFflag = new ActionRowBuilder().addComponents(botaoFflag);

            await canalFflag.send({ embeds: [embedFflag], components: [rowFflag] });
            console.log('Painel de FastFlags (Botão) enviado com sucesso!');
        }
    } catch (err) {
        console.error('Erro ao enviar painel de Fflags:', err);
    }

    // 2. Enviar painel de Executores (com Botões Separados)
    try {
        const canalExecutor = await client.channels.fetch(ID_CANAL_EXECUTOR);
        if (canalExecutor) {
            const embedExecutor = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🚀 EXECUTORES E FERRAMENTAS // yIL')
                .setDescription('Clica no botão correspondente abaixo para descarregar o software pretendido de forma segura.');

            // Botão para o FFM Installer
            const botaoFFM = new ButtonBuilder()
                .setCustomId('btn_baixar_ffm')
                .setLabel('Baixar FFM Installer')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📥');

            // Botão para o Velostrap
            const botaoVelostrap = new ButtonBuilder()
                .setCustomId('btn_baixar_velostrap')
                .setLabel('Baixar Velostrap')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📥');

            // Agrupa os dois botões na mesma linha
            const rowExecutor = new ActionRowBuilder().addComponents(botaoFFM, botaoVelostrap);

            await canalExecutor.send({ embeds: [embedExecutor], components: [rowExecutor] });
            console.log('Painel de Executores (Botões separados) enviado com sucesso!');
        }
    } catch (err) {
        console.error('Erro ao enviar painel de executores:', err);
    }
});

// Evento de Interações (Botões, Menus e Modais)
client.on('interactionCreate', async interaction => {
    
    // 1. Cliques em Botões
    if (interaction.isButton()) {
        
        // Botão para abrir o Modal de FastFlags
        if (interaction.customId === 'btn_gerar_fflag') {
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

        // Botão do FFM Installer
        if (interaction.customId === 'btn_baixar_ffm') {
            await interaction.deferReply({ ephemeral: true });
            try {
                await interaction.followUp({
                    content: '📥 Aqui está o teu **FFM Installer**:',
                    files: ['./FFM_Installer.exe'],
                    ephemeral: true
                });
            } catch (err) {
                console.error('Erro ao enviar FFM Installer:', err);
                await interaction.followUp({ content: '❌ Erro ao enviar o ficheiro.', ephemeral: true });
            }
        }

        // Botão do Velostrap
        if (interaction.customId === 'btn_baixar_velostrap') {
            await interaction.deferReply({ ephemeral: true });
            try {
                await interaction.followUp({
                    content: '📥 Aqui está o teu **Velostrap**:',
                    files: ['./Velostrap (1) (1).exe'],
                    ephemeral: true
                });
            } catch (err) {
                console.error('Erro ao enviar Velostrap:', err);
                await interaction.followUp({ content: '❌ Erro ao enviar o ficheiro.', ephemeral: true });
            }
        }
    }

    // 2. Menus de Seleção (caso ainda uses algum)
    if (interaction.isStringSelectMenu()) {
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

    // 3. Submissão do Modal das FastFlags
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
client.on('messageCreate', async message => {
    // Ignora mensagens de bots e mensagens que não começam com o comando !apagar
    if (message.author.bot || !message.content.startsWith('!apagar')) return;

    // Verifica se o membro tem permissão de gerir mensagens
    if (!message.member.permissions.has('ManageMessages')) {
        return message.reply('❌ Não tem moral o para usar esse comando, meu mano!');
    }

    // Separa os argumentos (ex: "!apagar 50" -> args[1] é "50")
    const args = message.content.trim().split(/ +/);
    const quantidade = parseInt(args[1]);

    if (!quantidade || isNaN(quantidade) || quantidade <= 0) {
        return message.reply('⚠️ Faz favor, meu truta, e indica um número válido entre 1 e 100 (Ex: `!apagar 50`).');
    }

    // Trava o limite estrito de no máximo 100 mensagens
    if (quantidade > 100) {
        return message.reply('⚠️ Parça, o limite máximo permitido por comando é de **100 mensagens** de uma só vez.');
    }

    try {
        // Busca as mensagens incluindo a do comando
        const messages = await message.channel.messages.fetch({ limit: quantidade + 1 });
        
        // Executa a exclusão em massa
        await message.channel.bulkDelete(messages, true);

        // Envia um aviso temporário que se apaga sozinho após 3 segundos
        const confirm = await message.channel.send(`🧹 **${quantidade}** mensagens apagadas com sucesso!`);
        setTimeout(() => confirm.delete().catch(() => {}), 3000);

    } catch (error) {
        console.error('Erro ao apagar mensagens:', error);
        message.reply('❌ Ocorreu um erro. Lembre-se que o Discord não permite apagar em mensagens em massa com mais de 14 dias de envio.');
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