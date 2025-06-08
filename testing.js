// freekeys-test.js
const freekeys = require('freekeys');

freekeys()
  .then(keys => {
    console.log('Free API keys:', keys);
  })
  .catch(err => {
    console.error('Error fetching keys:', err);
  });
