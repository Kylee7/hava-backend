const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ]
});

let isReady = false;

client.once('ready', () => {
    console.log(`✅ Discord Bot is ready!`);
    console.log(`📡 Logged in as ${client.user.tag}`);
    isReady = true;
});

client.on('error', (error) => {
    console.error('❌ Discord Bot error:', error);
});

// Login to Discord
if (process.env.DISCORD_BOT_TOKEN) {
    client.login(process.env.DISCORD_BOT_TOKEN).catch(err => {
        console.error('❌ Failed to login Discord Bot:', err.message);
    });
} else {
    console.warn('⚠️  DISCORD_BOT_TOKEN not found. Bot notifications disabled.');
}

// Send acceptance notification
async function sendAcceptanceNotification(discordId, username) {
    if (!isReady) {
        console.warn('Discord bot not ready. Skipping notification.');
        return;
    }

    try {
        const user = await client.users.fetch(discordId);

        const embed = new EmbedBuilder()
            .setColor(0x10b981)
            .setTitle('🎉 تم قبول تقديمك!')
            .setDescription(`مبروك **${username}**! تم قبول تقديمك في **Perfect CFW**`)
            .addFields(
                { name: '✅ الحالة', value: 'مقبول', inline: true },
                { name: '📅 التاريخ', value: new Date().toLocaleDateString('ar-EG'), inline: true }
            )
            .setFooter({ text: 'Perfect CFW Roleplay Server' })
            .setTimestamp();

        await user.send({ embeds: [embed] });
        console.log(`✅ Acceptance notification sent to ${username}`);
    } catch (error) {
        console.error('Error sending acceptance notification:', error.message);
    }
}

// Send rejection notification
async function sendRejectionNotification(discordId, username, reason) {
    if (!isReady) {
        console.warn('Discord bot not ready. Skipping notification.');
        return;
    }

    try {
        const user = await client.users.fetch(discordId);

        const embed = new EmbedBuilder()
            .setColor(0xef4444)
            .setTitle('❌ تم رفض تقديمك')
            .setDescription(`نأسف **${username}**، تم رفض تقديمك في **Perfect CFW**`)
            .addFields(
                { name: '📝 السبب', value: reason || 'لم يتم توضيح السبب' },
                { name: '🔄 إعادة التقديم', value: 'يمكنك التقديم مرة أخرى لاحقاً' }
            )
            .setFooter({ text: 'Perfect CFW Roleplay Server' })
            .setTimestamp();

        await user.send({ embeds: [embed] });
        console.log(`✅ Rejection notification sent to ${username}`);
    } catch (error) {
        console.error('Error sending rejection notification:', error.message);
    }
}

module.exports = {
    client,
    sendAcceptanceNotification,
    sendRejectionNotification
};
