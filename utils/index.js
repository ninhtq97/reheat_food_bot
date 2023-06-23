const fs = require('fs/promises');
const { FILE_PATHS } = require('../constants');

exports.toOrderKey = (owner) => `o:${owner}`;

exports.getViewName = (order) => {
  return order ? `${order.isUsername ? '@' : ''}${order.name}`.trim() : '';
};

exports.getName = (user) => {
  return {
    name:
      user.username ||
      `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    isUsername: !!user.username,
  };
};

exports.getData = async (path) => {
  const data = await fs.readFile(path);
  return JSON.parse(data);
};

exports.updateData = async (path, data) => {
  try {
    await fs.writeFile(path, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    return false;
  }
};

exports.shuffledArray = (arr) => arr.sort((a, b) => 0.5 - Math.random());
