exports.KEY = {
  ORDER: /((\/order@(.+?)|\/order) (.+))|\/order/,
  LIST_RANDOM: /(\/listrandom@(.+?))|\/listrandom/,
};

exports.GROUP_ID = -927404220;
exports.BOT_TOKEN = '6166433874:AAFOq2o49tK6nVDFycpIVGLMY7B7JOkiCyE';

exports.DIR_PATHS = {
  DATA: './data',
  ASSETS: './assets',
  IMAGES: './assets/images',
};

exports.FILE_PATHS = {
  ORDER: `${this.DIR_PATHS.DATA}/order.json`,
  REHEATING: `${this.DIR_PATHS.DATA}/reheating.json`,
};

exports.INIT_DATA = {
  ORDER: {},
  REHEATING: [],
};
