const { Telegraf } = require('telegraf');
const axios = require('axios');

// Берем из секретов GitHub
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const bot = new Telegraf(TELEGRAM_TOKEN);

async function generateImage(prompt) {
    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/images/generations',
            {
                model: 'black-forest-labs/flux-schnell',
                prompt: prompt
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.data[0].url;
    } catch (e) {
        console.error('Ошибка:', e.message);
        return null;
    }
}

bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;
    const wait = await ctx.reply('🎨 Рисую...');
    const url = await generateImage(ctx.message.text);
    if (url) await ctx.replyWithPhoto(url);
    else await ctx.reply('Ошибка. Проверь токены.');
    ctx.telegram.deleteMessage(ctx.chat.id, wait.message_id).catch(() => {});
});

bot.launch();
