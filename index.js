const chalk = require('chalk');
const ethers = require('ethers');
const fs = require('fs').promises;
const args = require('minimist')(process.argv.slice(2));
const WebSocket = require('ws');

let ConsoleLog = console.log;

// main classes
const { msg, config, cache, network } = require('./classes/main.js');

console.clear();
console.log(ethers);

const ws = new WebSocket('ws://localhost:3000'); // Adjust the WebSocket URL as needed

const logBotMessage = (message) => {
    const formattedMessage = `[bot] ${message}`;
    console.log(formattedMessage);

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(formattedMessage);
    }
};

msg.primary = (message) => logBotMessage(message);
msg.error = (message) => logBotMessage(message);
msg.success = (message) => logBotMessage(message);

msg.primary('[debug::main] Loading..');

// error handler
process.on('uncaughtException', (err, origin) => {
    msg.error(`[error::process] Exception: ${err}`);
    process.exit();
});

// main
(async () => {
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

    let startingTick = Math.floor(new Date().getTime() / 1000);
    let receipt = await network.transactToken(config.cfg.contracts.input, config.cfg.contracts.output);

    if (receipt == null) {
        msg.error('[error::main] Could not retrieve receipt from buy tx.');
        process.exit();
    }

    logBotMessage(chalk.hex('#2091F6').inverse('==================== [TX COMPLETED] ===================='));
    logBotMessage(chalk.hex('#2091F6')('• ') + chalk.hex('#EBF0FA')(`From ${cache.data.addresses[config.cfg.contracts.input].symbol} (${config.cfg.transaction.amount_in} ${cache.data.addresses[config.cfg.contracts.input].symbol}) -> ${cache.data.addresses[config.cfg.contracts.output].symbol} (minimum ${network.amount_bought_unformatted} ${cache.data.addresses[config.cfg.contracts.output].symbol})`));
    logBotMessage(chalk.hex('#2091F6')('• ') + chalk.hex('#EBF0FA')(`https://bscscan.com/tx/${receipt.logs[1].transactionHash}`));
    logBotMessage(chalk.hex('#2091F6').inverse('========================================================\n'));

    await cache.save();
    msg.success(`Finished in ${((Math.floor(new Date().getTime() / 1000)) - startingTick)} seconds.`);
    process.exit();
})();

setInterval(() => {}, 1 << 30);
