const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs/promises');
const { constants } = require('fs');
const { format, isBefore, setHours } = require('date-fns');
const {
  KEY,
  BOT_TOKEN,
  GROUP_ID,
  FILE_PATHS,
  INIT_DATA,
  REGEXP_REPLACE,
  REGEX_CALLBACK,
  DIR_PATHS,
} = require('./constants');
const {
  getKeyboardOrders,
  getData,
  getKeyboardPayeeMembers,
  updateData,
  toOrderKey,
  getName,
  getViewName,
  shuffledArray,
} = require('./utils');
const CronJob = require('cron').CronJob;

let reheatIdx = 0;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.setMyCommands([
  {
    command: 'order',
    description: 'Đăng ký quay cơm theo cú pháp: /order',
  },
  {
    command: 'listrandom',
    description: 'Danh sách quay cơm đã random',
  },
]);

(async () => {
  await fs.mkdir(DIR_PATHS.DATA, { recursive: true });

  try {
    await fs.access(FILE_PATHS.REHEATING, constants.R_OK);
  } catch (error) {
    await updateData(FILE_PATHS.REHEATING, INIT_DATA.REHEATING);
  }

  try {
    await fs.access(FILE_PATHS.ORDER, constants.R_OK);
  } catch (error) {
    await updateData(FILE_PATHS.ORDER, INIT_DATA.ORDER);
  }
})();

// bot.on('message', (msg) => {
//   console.log('Message:', msg);
// });

bot.onText(KEY.ORDER, async (msg, match) => {
  console.log('Msg:', msg);

  if (isBefore(new Date(), new Date(new Date().setHours(11, 15, 0, 0)))) {
    const orders = await getData(FILE_PATHS.ORDER);

    orders[toOrderKey(msg.from.id)] = getName(msg.from);

    await updateData(FILE_PATHS.ORDER, orders);
  }
});

bot.onText(KEY.LIST_RANDOM, async (msg) => {
  const orders = await getData(FILE_PATHS.ORDER);
  const sortedOrders = await getData(FILE_PATHS.REHEATING);

  if (sortedOrders.length) {
    let message = 'Danh sách thứ tự quay cơm:\n';
    for (const [i, o] of sortedOrders.entries()) {
      message = message.concat(
        `${i + 1}. ${orders[o].name}${i < sortedOrders.length ? '\n' : ''}`,
      );
    }

    bot.sendChatAction(msg.chat.id, 'typing');
    bot.sendMessage(msg.chat.id, message);
  }
});

const jobRemindOrder = new CronJob(
  '0 11 * * 1-5',
  async () => {
    bot.sendChatAction(GROUP_ID, 'typing');
    bot.sendMessage(
      GROUP_ID,
      `Đăng ký quay cơm để có một bữa trưa ngon miệng nào mn ơi 🍚🍚🍚`,
    );
  },
  null,
  true,
  'Asia/Ho_Chi_Minh',
);

const jobRemindReheat = new CronJob(
  '*/5 * * * 1-5',
  async () => {
    reheatIdx += 1;
    const orders = await getData(FILE_PATHS.ORDER);

    if (reheatIdx < Object.keys(orders).length) {
      const sortedOrders = await getData(FILE_PATHS.REHEATING);

      bot.sendMessage(
        GROUP_ID,
        `${getViewName(
          orders[sortedOrders[reheatIdx]],
        )}: Đã đến lượt bạn quay cơm. Thao tác nhanh nhẹn nào bạn ei 🔥🔥🔥`,
      );
    } else {
      jobRemindReheat.stop();
    }
  },
  null,
  false,
  'Asia/Ho_Chi_Minh',
);

const jobRandomList = new CronJob(
  '15 11 * * 1-5',
  async () => {
    bot.sendChatAction(GROUP_ID, 'typing');
    await bot.sendMessage(GROUP_ID, 'Thời gian order quay cơm đã hết ✨✨✨');

    const orders = await getData(FILE_PATHS.ORDER);

    const sortedOrders = shuffledArray(Object.keys(orders));

    if (sortedOrders.length) {
      await updateData(FILE_PATHS.REHEATING, sortedOrders);

      let message = 'Danh sách thứ tự quay cơm:\n';
      for (const [i, o] of sortedOrders.entries()) {
        message = message.concat(
          `${i + 1}. ${orders[o].name}${i < sortedOrders.length ? '\n' : ''}`,
        );
      }

      bot.sendChatAction(GROUP_ID, 'typing');
      await bot.sendMessage(GROUP_ID, message);
    }
  },
  null,
  true,
  'Asia/Ho_Chi_Minh',
);

const jobStartReheat = new CronJob(
  '30 11 * * 1-5',
  async () => {
    bot.sendChatAction(GROUP_ID, 'typing');

    const orders = await getData(FILE_PATHS.ORDER);
    const sortedOrders = await getData(FILE_PATHS.REHEATING);

    if (sortedOrders.length) {
      bot.sendMessage(
        GROUP_ID,
        `${getViewName(
          orders[sortedOrders[reheatIdx]],
        )}: Đã đến lượt bạn quay cơm. Thao tác nhanh nhẹn nào bạn ei 🔥🔥🔥`,
      );

      jobRemindReheat.start();
    }
  },
  null,
  true,
  'Asia/Ho_Chi_Minh',
);

const jobClean = new CronJob(
  '0 0 * * *',
  async function () {
    reheatIdx = 0;
    await updateData(FILE_PATHS.ORDER, INIT_DATA.ORDER);
    await updateData(FILE_PATHS.REHEATING, INIT_DATA.REHEATING);
  },
  null,
  true,
  'Asia/Ho_Chi_Minh',
);
