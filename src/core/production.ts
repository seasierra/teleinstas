import { VercelRequest, VercelResponse } from '@vercel/node';
import createDebug from 'debug';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { ensureWebhook } from './webhook';

const debug = createDebug('bot:dev');

const port = process.env.PORT || 4000;

const production = async (bot: Telegraf<Context<Update>>) => {
  debug('Bot runs in production mode');

  await bot.launch();
};
export { production };
