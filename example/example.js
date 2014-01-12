'use strict';

var Cool = require('./mycoolthing');

Cool('hello!').myCoolMethod().then(function () {
    console.log('done!');
});
