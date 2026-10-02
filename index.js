const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    SlashCommandBuilder, 
    REST, 
    Routes, 
    StringSelectMenuBuilder, 
    UserSelectMenuBuilder, 
    RoleSelectMenuBuilder, 
    ChannelSelectMenuBuilder, 
    PermissionFlagsBits,
    ChannelType
} = require('discord.js');

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
// Configurar Rich Presence / Status do Bot
    client.user.setPresence({
        activities: [{
            name: 'To administrando server',
            type: 0, // ActivityType.Playing (0)
        }],
        status: 'online',
    });

    // 1. Enviar painel de FastFlags (com Botão)
    try {
        const canalFflag = await client.channels.fetch(ID_CANAL_FFLAG);
        if (canalFflag) {
            const embedFflag = new EmbedBuilder()
                .setColor('#000000')
                .setTitle('⚡ GERADOR DE FLAG')
                .setDescription('Clique no botão abaixo para gerar uma Flag personalizada.');

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
                .setTitle('🚀 EXECUTORES E FERRAMENTAS')
                .setDescription('Clique no botão correspondente abaixo pra baixar o arquivo escolhido de forma segura.');

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

    // Registar Comandos Slash na API do Discord
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('🔄 A registar comandos slash (/) na API do Discord...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [commandAnunciar.toJSON()] },
        );
        console.log('✅ Comandos slash registados com sucesso, meu mano!');
    } catch (error) {
        console.error('Erro ao registar comandos slash:', error);
    }
});

// Evento de Interações (Botões e Menus)
client.on('interactionCreate', async interaction => {
    
    // 1. Cliques em Botões
    if (interaction.isButton()) {
        
        // Botão para abrir o Modal de FastFlags
        if (interaction.customId === 'btn_gerar_fflag') {
            const modal = new ModalBuilder()
                .setCustomId('modal_fastflag')
                .setTitle('Configurador de Flag');

            const input = new TextInputBuilder()
                .setCustomId('prompt_ff')
                .setLabel('O que pretende otimizar no Roblox?')
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
                    content: '📥 Aqui está o seu **FFM Installer**:',
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
                    content: '📥 Aqui está o seu **Velostrap**:',
                    files: ['./Velostrap (1) (1).exe'],
                    ephemeral: true
                });
            } catch (err) {
                console.error('Erro ao enviar Velostrap:', err);
                await interaction.followUp({ content: '❌ Erro ao enviar o Velostrap.', ephemeral: true });
            }
        }
    }

    // 2. Menus de Seleção
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
});

// Evento unificado e centralizado para Modais (FastFlags)
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'modal_fastflag') {
        await interaction.deferReply({ ephemeral: true });

        const userInput = interaction.fields.getTextInputValue('prompt_ff');

        try {
            const jsonResult = await gerarFastFlagGroq(userInput);

            await interaction.editReply({
                content: `⚡ **Flag Personalizada Gerada com Sucesso:**\n\`\`\`json\n${jsonResult}\n\`\`\``
            });
        } catch (error) {
            console.error('Erro ao gerar a flag:', error);
            await interaction.editReply({
                content: '❌ Ocorreu um erro ao gerar a flag. Tenta novamente depois!'
            });
        }
        return;
    }
});

// Comando de apagar mensagens
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!apagar')) return;

    if (!message.member.permissions.has('ManageMessages')) {
        return message.reply('❌ Mano, tu não tem moral (permissão) pra usar esse comando!');
    }

    const args = message.content.trim().split(/ +/);
    const quantidade = parseInt(args[1]);

    if (!quantidade || isNaN(quantidade) || quantidade <= 0) {
        return message.reply('⚠️ Pô, digita um número válido entre 1 e 100, tipo: `!apagar 50`.');
    }

    if (quantidade > 100) {
        return message.reply('⚠️ O limite máximo é de **100 mensagens** por vez, meu parceiro!');
    }

    try {
        await message.delete().catch(() => {});

        const messages = await message.channel.messages.fetch({ limit: quantidade });
        
        if (messages.size === 0) {
            return message.channel.send('⚠️ Nem tem mensagem recente pra apagar aqui, mano.').then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 3000);
            });
        }

        const deleted = await message.channel.bulkDelete(messages, true);

        const confirm = await message.channel.send(`🧹 **${deleted.size}** mensagens apagadas com sucesso, brabo!`);
        setTimeout(() => confirm.delete().catch(() => {}), 3000);

    } catch (error) {
        console.error('Deu ruim ao apagar as mensagens:', error);
        message.channel.send('❌ Deu treta. Lembra que o Discord não deixa apagar mensagens com mais de 14 dias ou mensagens fixadas no chat.').then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 4000);
        });
    }
});

// ==========================================
// SISTEMA DE ANÚNCIOS VIA SLASH COMMAND FLEXÍVEL
// ==========================================

const commandAnunciar = new SlashCommandBuilder()
    .setName('anunciar')
    .setDescription('Envia um anúncio em Embed Personalizada ou Texto Normal.')
    .addChannelOption(option => 
        option.setName('canal')
            .setDescription('Canal onde o anúncio vai ser enviado')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('tipo')
            .setDescription('Escolha o formato do anúncio')
            .setRequired(true)
            .addChoices(
                { name: 'Embed Personalizada', value: 'embed' },
                { name: 'Mensagem Normal (Texto Puro)', value: 'texto' }
            )
    )
    .addStringOption(option =>
        option.setName('mensagem')
            .setDescription('O conteúdo principal do anúncio')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('titulo')
            .setDescription('Título opcional do anúncio')
            .setRequired(false)
    )
    .addStringOption(option =>
        option.setName('cor')
            .setDescription('Cor da Embed em Hexadecimal (ex: #5865F2 ou 5865F2)')
            .setRequired(false)
    );

// Execução do comando /anunciar
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'anunciar') {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return interaction.reply({ content: '❌ Mano, tu não tem moral (permissão) pra usar esse comando!', ephemeral: true });
        }

        const canalDestino = interaction.options.getChannel('canal');
        const tipoEnvio = interaction.options.getString('tipo');
        const textoMensagem = interaction.options.getString('mensagem');
        const titulo = interaction.options.getString('titulo');
        const corInput = interaction.options.getString('cor');

        if (!canalDestino || !canalDestino.isTextBased()) {
            return interaction.reply({ content: '❌ Seleciona um canal de texto válido, mano!', ephemeral: true });
        }

        try {
            if (tipoEnvio === 'texto') {
                let conteudoFinal = textoMensagem;
                if (titulo) {
                    conteudoFinal = `**# ${titulo}**\n\n${textoMensagem}`;
                }
                await canalDestino.send({ content: conteudoFinal });

            } else if (tipoEnvio === 'embed') {
                let corHex = 0x5865F2;
                if (corInput) {
                    const limpaCor = corInput.replace('#', '');
                    const parsedColor = parseInt(limpaCor, 16);
                    if (!isNaN(parsedColor)) {
                        corHex = parsedColor;
                    }
                }

                const embedAnuncio = new EmbedBuilder()
                    .setDescription(textoMensagem)
                    .setColor(corHex)
                    .setTimestamp();

                if (titulo) {
                    embedAnuncio.setTitle(titulo);
                }

                await canalDestino.send({ embeds: [embedAnuncio] });
            }

            await interaction.reply({ content: `✅ Anúncio enviado com sucesso lá em ${canalDestino}, brabo!`, ephemeral: true });

        } catch (error) {
            console.error('Erro ao enviar anúncio:', error);
            await interaction.reply({ content: `❌ Deu ruim ao enviar o anúncio: \`${error.message}\``, ephemeral: true });
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