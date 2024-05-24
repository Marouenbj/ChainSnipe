const chalk = require('chalk');
const ethers = require('ethers');
const fs = require('fs').promises;
const args = require('minimist')(process.argv.slice(2));
const { sendLog } = require('./server'); // Import the sendLog function

const { msg, config, cache, network } = require('./classes/main.js');

console.clear();
console.log(ethers);

function logMessage(level, message) {
  console.log(message);
  sendLog(message);
}

msg.primary = (text) => logMessage('primary', chalk.blue(text));
msg.success = (text) => logMessage('success', chalk.green(text));
msg.warning = (text) => logMessage('warning', chalk.yellow(text));
msg.error = (text) => logMessage('error', chalk.red(text));

// Error handler
process.on('uncaughtException', (err, origin) => {
  msg.error(`[error::process] Exception: ${err}`);
  process.exit();
});

// Main async function
(async () => {
  try {
    await cache.load('cache.json');
    await config.load('config.ini');

    if (!network.isETH(config.cfg.contracts.input)) {
      msg.error(`[error::main] The free version of the bot can only use the BNB pair.`);
      process.exit();
    }

    await network.load();
    await network.prepare();

    console.clear();
    msg.primary('[debug::main] ChainSnipe v1 has been started.');

    if (network.bnb_balance == 0) {
      msg.error(`[error::init] You don't have any BNB in your account. (used for gas fee)`);
      process.exit();
    }

    if (network.input_balance < config.cfg.transaction.amount_in_formatted) {
      msg.error(`[error::init] You don't have enough input balance for this transaction.`);
      process.exit();
    }

    let pair = await network.getPair(config.cfg.contracts.input, config.cfg.contracts.output);
    msg.primary("[debug::main] Pair address: " + JSON.stringify(pair) + ".");

    let liquidity = await network.getLiquidity(pair);
    msg.primary(`[debug::main] Liquidity found: ${liquidity} ${cache.data.addresses[config.cfg.contracts.input].symbol}.\n`);

    msg.primary(`[debug::main] ChainSnipe process completed.`);
  } catch (err) {
    msg.error(`[error::main] Exception: ${err.message}`);
    process.exit();
  }
})();

setInterval(() => {}, 1 << 30);
