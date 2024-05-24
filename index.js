const chalk = require('chalk');
const ethers = require('ethers');
const fs = require('fs').promises;
const args = require('minimist')(process.argv.slice(2));

let ConsoleLog = console.log;

// main classes
const { msg, config, cache, network } = require('./classes/main.js');

console.clear();
console.log(ethers);

msg.primary('[debug::main] Loading..');

// error handler
process.on('uncaughtException', (err, origin) => {
    msg.error(`[error::process] Exception: ${err}`);
    process.exit();
});

// main
(async () => {
    try {
        msg.primary('[debug::main] Starting bot initialization...');
        
        msg.primary('[debug::main] Loading cache...');
        await cache.load('cache.json');
        msg.success('[debug::main] Cache loaded successfully.');

        msg.primary('[debug::main] Loading config...');
        await config.load('config.ini');
        msg.success('[debug::main] Config loaded successfully.');

        if (!network.isETH(config.cfg.contracts.input)) {
            msg.error(`[error::main] The free version of the bot can only use the BNB pair.`);
            process.exit();
        }

        msg.primary('[debug::network] Initializing network...');
        await network.load();
        msg.success('[debug::network] Network initialized successfully.');

        msg.primary('[debug::network] Preparing network...');
        await network.prepare();
        msg.success('[debug::network] Network prepared successfully.');

        // print debug info
        console.clear();

        msg.primary('[debug::main] ChainSnipe v1 has been started.');

        // balance check
        msg.primary('[debug::balance] Checking BNB balance...');
        if (network.bnb_balance == 0) {
            msg.error(`[error::init] You don't have any BNB in your account. (used for gas fee)`);
            process.exit();
        }

        msg.primary('[debug::balance] Checking input balance...');
        if (network.input_balance < config.cfg.transaction.amount_in_formatted) {
            msg.error(`[error::init] You don't have enough input balance for this transaction.`);
            process.exit();
        }

        msg.primary('[debug::pair] Fetching pair...');
        let pair = await network.getPair(config.cfg.contracts.input, config.cfg.contracts.output);
        msg.success("[debug::main] Pair address: " + JSON.stringify(pair) + ".");

        msg.primary('[debug::liquidity] Getting liquidity...');
        let liquidity = await network.getLiquidity(pair);
        msg.success(`[debug::main] Liquidity found: ${liquidity} ${cache.data.addresses[config.cfg.contracts.input].symbol}.\n`);

        // get starting tick
        let startingTick = Math.floor(new Date().getTime() / 1000);

        // purchase token [bnb -> token (through bnb)]
        msg.primary('[debug::transaction] Executing transaction...');
        let receipt = await network.transactToken(
            config.cfg.contracts.input,
            config.cfg.contracts.output
        );

        if (receipt == null) {
            msg.error('[error::main] Could not retrieve receipt from buy tx.');
            process.exit();
        }

        console.log(chalk.hex('#2091F6').inverse('==================== [TX COMPLETED] ===================='));
        console.log(chalk.hex('#2091F6')('• ') + chalk.hex('#EBF0FA')(`From ${cache.data.addresses[config.cfg.contracts.input].symbol} (${config.cfg.transaction.amount_in} ${cache.data.addresses[config.cfg.contracts.input].symbol}) -> ${cache.data.addresses[config.cfg.contracts.output].symbol} (minimum ${network.amount_bought_unformatted} ${cache.data.addresses[config.cfg.contracts.output].symbol})`));
        console.log(chalk.hex('#2091F6')('• ') + chalk.hex('#EBF0FA')(`https://bscscan.com/tx/${receipt.logs[1].transactionHash}`));
        console.log(chalk.hex('#2091F6').inverse('========================================================\n'));

        // save cache just to be sure
        msg.primary('[debug::cache] Saving cache...');
        await cache.save();
        msg.success('[debug::cache] Cache saved successfully.');

        msg.success(`Finished in ${((Math.floor(new Date().getTime() / 1000)) - startingTick)} seconds.`);
    } catch (error) {
        msg.error(`[error::main] Uncaught error: ${error}`);
    }
})();

setInterval(() => {}, 1 << 30);
