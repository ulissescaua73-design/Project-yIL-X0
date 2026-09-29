const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // Necessário para o sistema de boas-vindas funcionar
    ]
});

// Importa e ativa o sistema de boas-vindas do ficheiro welcome.js
const welcomeSystem = require('./welcome.js');
welcomeSystem(client);
// Importa e ativa o sistema de IA do ficheiro aiChat.js
const aiChatSystem = require('./aiChat.js');
aiChatSystem(client);
// Importa e ativa o sistema de moderação
const moderationSystem = require('./moderation.js');
moderationSystem(client);
// ID do canal onde vai aparecer o painel interativo
const ID_CANAL_PAINEL = '1554225648770482216'; 

client.once('ready', async () => {
    console.log(`Bot online e com muita aura! Logado como ${client.user.tag}`);

    
  /*  // Descomenta apenas na 1ª vez se quiseres enviar o painel interativo de novo para o canal
    const canal = await client.channels.fetch(ID_CANAL_PAINEL);
    if (canal) {
        const painelEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🔥 PAINEL INTERATIVO // yIL')
            .setDescription('Escolha uma das opções abaixo no menu para continuar:');

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('painel_principal')
                    .setPlaceholder('⚡ Selecione uma opção cyberpunk...')
                    .addOptions([
                        {
                            label: 'Fflag op',
                            description: 'Gera a sua Fflag de forma privada.',
                            value: 'fflag_opcao',
                            emoji: '⚙️'
                        },
                        {
                            label: 'Executor',
                            description: 'Abre o menu de downloads e executores.',
                            value: 'executor_opcao',
                            emoji: '🚀'
                        }
                    ])
            );

        await canal.send({
            content: '@everyone',
            embeds: [painelEmbed],
            components: [row]
        });
        console.log('Painel fixo enviado com sucesso!');
    }
    */
});

// EVENTO DOS BOTÕES E MENUS DO PAINEL
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'painel_principal') {
        const escolha = interaction.values[0];

        if (escolha === 'fflag_opcao') {
            await interaction.reply({
                content: `⚡ **Fflag Gerada com Sucesso:**\n\`\`\`json
{
  "DFIntTaskSchedulerTargetFps": "2147483647",
  "FFlagTaskSchedulerLimitTargetFpsTo2402": "False",
  "FFlagEnableReducedLatency": "true",
  "FFlagFixControllerInputLag": "True",
  "FFlagDisablePostFx": "true",
  "DFFlagDebugRenderForceTechnologyVoxel": "True",
  "DFFlagTextureQualityOverrideEnabled": "True",
  "DFIntTextureQualityOverride": "0",
  "FIntFRMMaxGrassDistance": "0",
  "FIntFRMMinGrassDistance": "0",
  "DFIntCSGLevelOfDetailSwitchingDistance": "0",
  "DebugForceMSAASamples": "0",
  "DebugSimAdaptiveEnable60HzHumanoids": "false",
  "SimAdaptiveHumanoidPDControllerSubstepMultiplier": "32",
  "SimDefaultHumanoidTimestepMultiplier": "8",
  "TimestepArbiterHumanoidLinearVelThreshold": "1",
  "TimestepArbiterHumanoidTurningVelThreshold": "1",
  "HumanoidStateUserRuntimesSyncPrims": "true",
  "DFIntS2PhysicsSenderRate": "600",
  "DFIntMaxMissedWorldStepsRemembered": "1",
  "DFIntRakNetLoopMs": "1",
  "DFIntWorldStepMax": "1",
  "DFIntNetPriorityFactor": "1",
  "DFIntNetworkLatencyTarget": "1",
  "DFFlagEnableRequestAsyncCompression": "True",
  "FFlagDebugDisplayFPS": "True"
}
\`\`\``,
                ephemeral: true
            });
        } 
        else if (escolha === 'executor_opcao') {
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