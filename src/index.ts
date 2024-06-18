import { kv } from '@vercel/kv';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { ensureWebhook } from './core/webhook';
import { getPost, getUser } from './scrap';
import { isValidURL, sleep } from './utils';
import moment = require('moment');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

bot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'reset', description: 'Reset all subscriptions' },
  { command: 'remove', description: 'Remove a subscription' },
  { command: 'subscriptions', description: 'List all subscriptions' },
  { command: 'profile', description: 'Show Instagram profile data' },
]);

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

bot.command('profile', async (ctx) => {
  const url = ctx.message.text.split(' ')[1];

  const userName = new URL(url).pathname.split('/').filter(Boolean)[0];

  const user = await getUser(userName);

  kv.append(`users:${ctx.message.from.id}:${userName}`, JSON.stringify(user));

  ctx.replyWithPhoto(
    { url: user.profile_pic_url_hd },
    {
      caption: `Username: ${user.username}\nFull Name: ${user.full_name}\nFollowers: ${user.edge_followed_by.count}\nFollowing: ${user.edge_follow.count}\nPosts: ${user.edge_owner_to_timeline_media.count}\nBio: ${user.biography}`,
    },
  );
});

bot.command('comments', async (ctx) => {
  ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  const url = ctx.message.text.split(' ')[1];

  const userName = new URL(url).pathname.split('/').filter(Boolean)[0];

  const user = await getUser(userName);

  const postsWIthComments = user.images.filter(
    (image: any) => image.comments_count > 0,
  );

  const posts = [];

  for (const postData of postsWIthComments) {
    const post = await getPost(postData.shortcode);

    posts.push(post);

    await sleep(1000);

    ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
  }

  const comments = posts
    .flatMap((post) => {
      return post.comments as {
        id: string;
        text: string;
        created_at: number;
        owner: string;
      };
    })
    .filter((comment) =>
      moment(comment.created_at * 1000).isAfter(moment().subtract(14, 'day')),
    );

  ctx.reply(
    `Comments in the last 14 days: ${comments.length}\n\n${comments
      .map(
        (comment) =>
          `Comment: ${comment.text}\nOwner: ${comment.owner}\nDate: ${moment(
            comment.created_at * 1000,
          ).format('DD/MM/YYYY HH:mm')}\n\n`,
      )
      .join('')}`,
  );
});

bot.on(message('text'), async (ctx) => {
  if (isValidURL(ctx.message.text)) {
    const urlExists = await kv.sismember(
      `urls:${ctx.message.from.id}`,
      ctx.message.text,
    );

    if (!urlExists) {
      await kv.sadd(`urls:${ctx.message.from.id}`, ctx.message.text);

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
