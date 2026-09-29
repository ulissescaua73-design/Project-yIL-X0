const { PermissionsBitField } = require('discord.js');

module.exports = (client) => {
    client.on('messageCreate', async message => {
        // Ignora bots e mensagens que não comecem por um prefixo (vamos usar '!')
        if (message.author.bot || !message.content.startsWith('!')) return;

        // Separa o comando dos argumentos (ex: "!ban @usuario motivo")
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // --------------------------------------------------
        // COMANDO DE KICK (Expulsar)
        // --------------------------------------------------
        if (command === 'kick') {
            // Verifica se quem mandou o comando tem permissão para expulsar membros
            if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return message.reply('❌ Tu não tens moral (permissão) para usar este comando, truta!');
            }

            const member = message.mentions.members.first();
            if (!member) return message.reply('⚠️ Marca quem tu queres expulsar, parça! Ex: `!kick @usuario`');

            if (!member.kickable) return message.reply('❌ Não consigo expulsar este membro. O cargo dele pode ser superior ao meu!');

            const reason = args.slice(1).join(' ') || 'Sem motivo especificado';

            try {
                await member.kick(reason);
                await message.reply(`✅ O meliante **${member.user.tag}** foi mandado embora da pista! Motivo: *${reason}*`);
            } catch (err) {
                console.error(err);
                await message.reply('❌ Deu ruim ao tentar expulsar o maluco.');
            }
        }

        // --------------------------------------------------
        // COMANDO DE BAN (Banir)
        // --------------------------------------------------
        if (command === 'ban') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return message.reply('❌ Tu não tem moral para banir ninguém, parça!');
            }

            const member = message.mentions.members.first();
            if (!member) return message.reply('⚠️ Marca quem tu queres banir do mapa! Ex: `!ban @usuario`');

            if (!member.bannable) return message.reply('❌ Não consigo banir este membro. O cargo dele é muito alto!');

            const reason = args.slice(1).join(' ') || 'sem motivo especificado';

            try {
                await member.ban({ reason });
                await message.reply(`🔨 O usuário **${member.user.tag}** foi banido com sucesso e nunca mais pisa aqui! Motivo: *${reason}*`);
            } catch (err) {
                console.error(err);
                await message.reply('❌ Deu ruim ao tentar banir o indivíduo.');
            }
        }

        // --------------------------------------------------
        // COMANDO DE MUTE (Silenciar por Tempo / Timeout)
        // --------------------------------------------------
        if (command === 'mute') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                return message.reply('❌ Tu não tem permissão para calar a boca dos outros, truta!');
            }

            const member = message.mentions.members.first();
            if (!member) return message.reply('⚠️ Marca quem vai ficar de castigo! Ex: `!mute @usuario 10m`');

            // Pega o tempo (ex: 10m, 1h, 1d) e converte para milissegundos
            const timeArg = args[1];
            if (!timeArg) return message.reply('⚠️ Especifica o tempo do mute, parça! (Ex: `5m` para 5 minutos, `1h` para 1 hora)');

            let durationMs = 0;
            const unit = timeArg.slice(-1);
            const value = parseInt(timeArg);

            if (unit === 'm') durationMs = value * 60 * 1000;
            else if (unit === 'h') durationMs = value * 60 * 60 * 1000;
            else if (unit === 'd') durationMs = value * 24 * 60 * 60 * 1000;
            else return message.reply('❌ Formato de tempo inválido! Usa `m` para minutos, `h` para horas ou `d` para dias.');

            try {
                await member.timeout(durationMs, 'Silenciado via comando de moderação');
                await message.reply(`🤐 O usuário **${member.user.tag}** foi silenciado por **${timeArg}**. Tá silenciado, aproveita pra ficar pensativo!`);
            } catch (err) {
                console.error(err);
                await message.reply('❌ Deu ruim ao tentar aplicar o timeout no maluco.');
            }
        }
    });
};