# Bitcoin trading dca - serverless

Based upon the work of https://github.com/0x13a/bitcoin-trading-dca.

This node script let you set a daily amount to invest on crypto currency (Bitcoin in this case) via the [kraken crypto exchange](https://kraken.com).

Unfortunately aws lambda don't support node 8 yet so this project uses
webpack to transpile your javascript and upload it to aws.

### Dollar Cost Averaging

> Dollar-cost averaging (DCA) is an investment technique of buying a fixed dollar amount of a particular investment on a regular schedule, regardless of the share price. The investor purchases more shares when prices are low and fewer shares when prices are high.

Dollar Cost Averaging has being initially used in the stock market to pursue an investment on an higher number of stocks with the same amount spend, just by investing it in a longer period of time due to the volatility of the stocks.

In the case of crypto-currency is well known that the volatility of those assets is way higher than the traditional shares purchased in the stock market. This makes the Dollar Cost Averaging strategy well suited for this type of investments.

### How you should choose investment amount and range
This highly depends on your risk level, in my case what I've done is set up a total investment amount.
Let's say I want to invest 1000$ and I want to spread my investment for 3 months. I also know I want to invest daily to take advantage of the volatility of the bitcoin against the dollar.

> 1000 / (3 * 30) = 1000 / 90 = ~11$ / day

### Disclaimer

Dollar Cost Averaging is meant to be used as a long-term strategy. This does not mean that returns are guaranteed, it's an investment and it's on your own risk. The general idea of this is to be used as [Buy, hold and don't watch too closely](https://www.cnbc.com/2016/03/04/warren-buffett-buy-hold-and-dont-watch-too-closely.html)

### Requirements

- [Install the Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/installation/)
- [Configure your AWS CLI](https://serverless.com/framework/docs/providers/aws/guide/credentials/)
- [Kraken API KEY](https://kraken.com)

### Installation

To create a new Serverless project with ES7 support.

``` bash
$ serverless install --url https://github.com/izifortune/bitcoin-trading-dca-serverless --name my-project
```

Enter the new directory

``` bash
$ cd my-project
```

Install the Node.js packages

``` bash
$ npm install
```

### Configuration

You will need to modify the `serverless.yml`: 

```yml
custom:
  logsBucket: myBucketName
  logsFile: myLogFileHere
```

`logsBucket` refer to the bucket name where do you want to log the transaction
information. `logsFile` is the file name where to store the logs.

```yml
    environment:
      KRAKEN_KEY=myKrakenKeyHere
      KRAKEN_SECRET=myKrakenSecretKeyHere
      INVESTMENT_AMOUNT=11.11
      ASSETS_PAIR=XXBTZEUR
```

Add all the info for kraken API as environment variables.

### Schedule

By default the schedule its setup through a cron job of aws lambda once
a day.

```
cron(0 10 * * ? *)
```

You can modify this editing `serverless.yml`:

```yml
events:
 - schedule: cron(0 10 * * ? *)
```

### Usage

To run a function on your local

``` bash
$ serverless invoke local --function start
```

Deploy your project

``` bash
$ serverless deploy
```

To add another function as a new file to your project, simply add the new file and add the reference to `serverless.yml`. The `webpack.config.js` automatically handles functions in different files.
