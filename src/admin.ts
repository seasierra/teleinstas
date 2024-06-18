import { Telegraf } from 'telegraf';

import { kv } from '@vercel/kv';
import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { message } from 'telegraf/filters';
import { development, production } from './core';
import { ensureWebhook } from './core/webhook';
import moment = require('moment');

const BOT_TOKEN = process.env.BOT_TOKEN_ADMIN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

export const bot = new Telegraf(BOT_TOKEN);
const openai = new OpenAI();

if (ENVIRONMENT === 'production') {
  ensureWebhook(bot);
}

let messages: ChatCompletionMessageParam[] = [];

const msgIndex: Record<string, ChatCompletionMessageParam[]> = {};

const chatMsg = (id: string) => {
  msgIndex[id] = msgIndex[id] || [];
  return msgIndex[id];
};

bot.on(message('text'), async (ctx) => {
  const chatId = await kv.get<string>(`admin:${ctx.from.id}`);

  if (chatId) {
    new Telegraf(process.env.BOT_TOKEN || '').telegram.sendMessage(
      chatId,
      ctx.message.text,
    );
  }

  if (ctx.message.text === '/start') {
    ctx.reply('Adding ID');

    await kv.del(`admin:${ctx.from.id}`);

    const adminId = await kv.get<string>('admin:chat');

    ctx.reply(adminId || 'NO ID');
  }

  if (ctx.message.text.startsWith('/user_')) {
    const [, username, chatId] = ctx.message.text.split('_');

    ctx.reply(`Sending to @${username}`);
    await kv.set(`admin:${ctx.from.id}`, chatId);
  }
});

export const sendAdmin = async (text: string) => {
  const admin = await kv.get<string>('admin:chat');

  if (!admin) return;

  bot.telegram.sendMessage(admin, text);
};

// bot.on(message('text'), async (ctx) => {
//   ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

//   console.log([
//     {
//       role: 'system',
//       content: prompt,
//     },
//     ...messages,
//   ]);

//   messages.push({
//     role: 'user',
//     content: ctx.message.text,
//   });

//   const response = await openai.chat.completions
//     .create({
//       model: 'gpt-4o',
//       messages: [
//         {
//           role: 'system',
//           content: prompt,
//         },
//         ...messages,
//       ],
//     })
//     .then((v) => v.choices[0].message.content);

//   if (response) {
//     messages.push({
//       role: 'assistant',
//       content: response,
//     });

//     ctx.reply(response);
//   }
// });

if (process.env.NODE_ENV === 'production') {
  production(bot);
}

if (process.env.NODE_ENV === 'development') {
  development(bot);
}
