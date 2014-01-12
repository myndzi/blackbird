'use strict';

var Cool = require('./mycoolthing');

var res = Cool.myCoolMethod().then(function () {
    console.log('done!');
});
console.log('...');
res();
