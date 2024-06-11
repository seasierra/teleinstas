import { kv } from '@vercel/kv';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

// import { about } from './commands';
// import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { isValidURL } from './utils';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

bot.on(message('text'), async (ctx) => {
  if (isValidURL(ctx.message.text)) {
    kv.sadd(`urls:${ctx.message.from.id}`, ctx.message.text);
  }
});

bot.command('/subscriptions', async (ctx) => {
  const urls = await kv.smembers(`urls:${ctx.message.from.id}`);
  ctx.reply(urls.join('\n'));
});

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
