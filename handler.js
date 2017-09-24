const AWS = require('aws-sdk');
const Kraken = require('kraken-api');

const s3 = new AWS.S3();
const timestamp = () => new Date().toISOString();
// set an higher timeout
const client = new Kraken(process.env.KRAKEN_KEY, process.env.KRAKEN_SECRET, {
  timeout: 60 * 60 * 48 * 1000
});

const investmentAmount = process.env.INVESTMENT_AMOUNT;
// see full list of exhange pairs here
// https://api.kraken.com/0/public/AssetPairs
const pair = (process.env.ASSETS_PAIR || 'XXBTZEUR').toUpperCase();

const cryptoCurrency = pair.split('X')[1].slice(0, 3);
const fiatCurrency = pair.split('Z')[1].slice(0, 3);

const logging = async log => {
  try {
    const data = await s3.getObject({
      Bucket: process.env.BUCKET,
      Key: process.env.LOG_FILE
    }).promise();
    const body = data ? data.Body.toString('ascii') + '\n' : '';
    await s3.putObject({
      Bucket: process.env.BUCKET,
      Key: process.env.LOG_FILE,
      Body: body + log
    }).promise();
  } catch (e) {
    console.error(e);
  }
};

export const start = async (event, context, callback) => {
  try {
    // Retrieve crypto/eur price
    const tickResponse = await client.api('Ticker', {pair});
    const cryptoPrice = tickResponse['result'][pair]['a'][0];
    if (typeof cryptoPrice === 'undefined') {
      callback(null, { error: 'cryptoCurrency undefined' })
      return;
    }
    const volumeToBuy = (investmentAmount/cryptoPrice).toFixed(6);
    const roundedInvestmentAmount = (volumeToBuy*cryptoPrice).toFixed(3);

    // Kraken does not allow to buy less than 0.002XBT
    if (volumeToBuy < 0.002) {
      callback(null, { error: 'Increase your investmentAmount' })
    }
    const logMessage = `[${timestamp()}] Buying ${volumeToBuy} ${cryptoCurrency}` +
      ` which is equal to ${roundedInvestmentAmount} ${fiatCurrency}` +
      ` at price ${cryptoPrice} ${fiatCurrency}/${cryptoCurrency}\n`;
    // Log prices to file
    await logging(logMessage);
    // buy disposed amount for today
    const tradeResponse = await client.api('AddOrder', {
      pair,
      volume: volumeToBuy,
      type: 'buy',
      ordertype: 'market'
    });
    // Retrieve and log transaction ids
    const txIds = tradeResponse['result']['txid'];
    if (typeof txIds === 'undefined') {
      callback(null, { error: 'Unable to read transaction ids' });
    }
    callback(null, { message: txIds, event });
  } catch (e) {
    callback(null, { error: e, event });
  }
}
