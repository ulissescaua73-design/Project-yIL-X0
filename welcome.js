const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

function getConfig() {
    try {
        if (fs.existsSync('./welcome-config.json')) {
            return JSON.parse(fs.readFileSync('./welcome-config.json', 'utf8'));
        }
    } catch (e) {
        console.error('Erro ao ler config de boas-vindas:', e);
    }
    return {};
}

function saveConfig(config) {
    fs.writeFileSync('./welcome-config.json', JSON.stringify(config, null, 4));
}

module.exports = (client) => {
    // --------------------------------------------------
    // COMANDO PARA DEFINIR O CANAL: !setwelcome
    // --------------------------------------------------
    client.on('messageCreate', async message => {
        if (message.author.bot || !message.content.startsWith('!')) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'setwelcome') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply('❌ Tu não tem moral para mexer nas configurações, truta!');
            }

            const targetChannel = message.mentions.channels.first() || message.channel;

            const config = getConfig();
            config[message.guild.id] = targetChannel.id;
            saveConfig(config);

            await message.reply(`✅ Canal de boas-vindas configurado com sucesso para ${targetChannel}! Agora a rapaziada vai ser recebida lá em estilo.`);
        }
    });

    // --------------------------------------------------
    // EVENTO DE ENTRADA DO MEMBRO: guildMemberAdd
    // --------------------------------------------------
    client.on('guildMemberAdd', async member => {
        const config = getConfig();
        const channelId = config[member.guild.id];

        if (!channelId) return;

        const welcomeChannel = member.guild.channels.cache.get(channelId);
        if (!welcomeChannel) return;

        // Cria o Embed estilizado com imagem
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#080404') // Estilo tech/cyberpunk
            .setTitle('🚀 Novo membro na quebrada!')
            .setDescription(`Eae, **${member}**. Seja bem-vindo ao servidor **${member.guild.name}**.\n\nCola nos canais, troca ideia com a cupula e curte o role por aqui!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setImage('https://media.discordapp.net/attachments/1451960847881474140/1550491226711662702/unknown_2026.08.13-15.05_1.png?ex=6abbb5fb&is=6aba647b&hm=3c45c2bab4253a794479cb9bcfe7686d22158c1e15d078ba4517413f4cc34989&=&format=webp&quality=lossless') // <-- Insere o link direto da imagem aqui (ex: link de um banner)
            .setTimestamp();

        try {
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        } catch (err) {
            console.error('Erro ao enviar a mensagem de boas-vindas com imagem:', err);
        }
    });
};