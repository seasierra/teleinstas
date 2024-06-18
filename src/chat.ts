import { Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

// import { sendAdmin } from './admin';

import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { development, production } from './core';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);
const openai = new OpenAI();

let messages: ChatCompletionMessageParam[] = [];

const msgIndex: Record<string, ChatCompletionMessageParam[]> = {};

bot.command('/start', (ctx) => {
  messages = [];
});

const threads: any = {};
const runs: any = {};
const cache: any = {};

bot.on(message('text'), async (ctx) => {
  ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  // sendAdmin(ctx.message.text);

  if (!threads[ctx.chat.id]) {
    const thread = await openai.beta.threads.create();
    threads[ctx.chat.id] = thread.id;
  }

  const threadId = threads[ctx.chat.id];

  openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: ctx.message.text,
  });

  openai.beta.threads.runs
    .stream(threadId, {
      assistant_id: process.env.ASSISTENT_ID || '',
    })
    .on('event', (event) => {
      if (event.event === 'thread.run.failed') {
        console.error('Run failed');
        console.error(event.data.last_error?.message);
      }
    })
    .on('textDone', (m) => {
      const list = m.value.match(/\*\*(.*?)\*\*/g);

      Markup.removeKeyboard();

      const text = m.value
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/^\$\$TYPE.*$/gi, '');

      console.log(list);

      // sendAdmin(
      //   `${text}

      //   /user_${ctx.from.username}_${ctx.chat.id}`,
      // );

      ctx.reply(text);
    })
    .on('error', (m) => ctx.reply(m.message));

  // memo(ctx.chat.id.toString(), () =>
  // openai.beta.threads.runs
  //   .stream(threads[ctx.chat.id], {
  //     assistant_id: 'asst_wYvc9v9QGBWjaeUjWwWAd4C7',
  //     // assistant_id: 'asst_yMwrVuNrwjAePekNYUW8XOoN',
  //   })
  //   .on('textDone', (m) => {
  //     const list = m.value.match(/\*\*(.*?)\*\*/g);

  //     Markup.removeKeyboard();

  //     const text = m.value
  //       .replace(/\*\*(.*?)\*\*/g, '$1')
  //       .replace(/^\$\$TYPE.*$/gi, '');

  //     console.log(list);

  //     // sendAdmin(
  //     //   `${text}

  //     //   /user_${ctx.from.username}_${ctx.chat.id}`,
  //     // );

  //     ctx.reply(text);
  //   })
  //   .on('error', (m) => console.log(m)),
  // );

  // if (await kv.get('admin')) {
  //   return;
  // }
});

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
