const crypto = require('crypto');
const params = {
    mchId: '10001',
    money: '100',
    notify_url: 'https://your-domain.com/callback',
    out_trade_no: 'ORDER_1771516269',
    return_url: 'https://your-domain.com/success'
};
const key = 'b051b2a95305ce3f84ce0f10da467ff9';

const sortedKeys = Object.keys(params).sort();
const stringA = sortedKeys
    .map(k => `${k}=${params[k]}`)
    .join('&');

const stringSignTemp = `${stringA}&key=${key}`;
console.log('StringA:', stringA);
console.log('StringSignTemp:', stringSignTemp);
const sign = crypto.createHash('md5').update(stringSignTemp).digest('hex').toLowerCase();
console.log('Generated Sign:', sign);
