import { kv } from '@vercel/kv';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { isValidURL } from './utils';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

bot.command('start', async (ctx) => {
  const subs = await kv.scard(`urls:${ctx.message.from.id}`);

  ctx.reply(`Welcome! Current subscriptions: ${subs}`);
});

bot.command('reset', async (ctx) => {
  await kv.del(`urls:${ctx.message.from.id}`);

  ctx.reply('All subscriptions have been removed.');
});

bot.command('remove', async (ctx) => {
  const url = ctx.message.text.split(' ')[1];

  await kv.del(`urls:${ctx.message.from.id}`, url);

  ctx.reply('Account removed from your subscriptions.');
});

bot.command('subscriptions', async (ctx) => {
  const urls = await kv.smembers(`urls:${ctx.message.from.id}`);

  ctx.reply(urls.join('\n'));
});

bot.on(message('text'), async (ctx) => {
  if (isValidURL(ctx.message.text)) {
    const urlExists = await kv.sismember(
      `urls:${ctx.message.from.id}`,
      ctx.message.text,
    );

    if (!urlExists) {
      await kv.sadd(`urls:${ctx.message.from.id}`, ctx.message.text);
      console.log(ctx.message.from.id);

      ctx.reply('Account added to your subscriptions.');
    } else {
      ctx.reply('This account is already in your subscriptions.');
    }
  } else {
    ctx.reply('Invalid URL. Please provide a valid URL.');
  }
});

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
