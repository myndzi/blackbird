'use strict';

var Blackbird = require('../index.js'); //require('blackbird');

module.exports = new Blackbird(function (Promise) {
    function MyCoolThing(message) {
        this.message = message || 'defaultMessage';
    }
    MyCoolThing.prototype.myCoolMethod = function () {
        // you can return a promise or return values or throw errors
        // they will all get picked up by Bluebird
        console.log(this.message);
        return Promise.delay(1000);
    };

    Promise.extend('myCoolMethod');
    Promise.bindStatics();

    return MyCoolThing; // don't forget this!
});
