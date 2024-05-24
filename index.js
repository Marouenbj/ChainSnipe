const chalk = require('chalk');
const ethers = require('ethers');
const fs = require('fs').promises;
const args = require('minimist')(process.argv.slice(2));
const { msg, config, cache, network } = require('./classes/main.js');

const PORT = process.env.PORT || 3001;

console.clear();
console.log(ethers);

// Error handler
process.on('uncaughtException', (err, origin) => {
  console.error(`[error::process] Exception: ${err}`);
  process.exit();
});

// Main async function
(async () => {
  try {
    await cache.load('cache.json');
    await config.load('config.ini');

    if (!network.isETH(config.cfg.contracts.input)) {
      console.error(`[error::main] The free version of the bot can only use the BNB pair.`);
      process.exit();
    }

    await network.load();
    await network.prepare();

    console.clear();
    console.log('[debug::main] ChainSnipe v1 has been started.');

    if (network.bnb_balance == 0) {
      console.error(`[error::init] You don't have any BNB in your account. (used for gas fee)`);
      process.exit();
    }

    if (network.input_balance < config.cfg.transaction.amount_in_formatted) {
      console.error(`[error::init] You don't have enough input balance for this transaction.`);
      process.exit();
    }

    let pair = await network.getPair(config.cfg.contracts.input, config.cfg.contracts.output);
    console.log("[debug::main] Pair address: " + JSON.stringify(pair) + ".");

    let liquidity = await network.getLiquidity(pair);
    console.log(`[debug::main] Liquidity found: ${liquidity} ${cache.data.addresses[config.cfg.contracts.input].symbol}.\n`);

    console.log(`[debug::main] ChainSnipe process completed.`);
  } catch (err) {
    console.error(`[error::main] Exception: ${err.message}`);
    process.exit();
  }
})();

setInterval(() => {}, 1 << 30);
