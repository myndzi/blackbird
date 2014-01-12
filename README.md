# Blackbird
This module helps you to build a hybrid promise/fluent API. The idea is to get as much javascript out of your way as possible, enabling you to write a clean, descriptive interface.

Example:

    var myObj = new Thing();
    
    myObj.returnsAPromise()
    .then(function (res) {
        return myObj.doSomethingElse(res);
    });

becomes:

    var myObj = new Thing();
    
    myObj().returnsAPromise()
           .doSomethingElse();

the `this` argument inside the methods will point to `myObj`. They will be passed the result of the previous promise value as the first argument, and any literal arguments you specify after that:

    function Thing() {
    }
    Thing.prototype.foo = function () { return 'hello'; };
    Thing.prototype.bar = function (res, arg) {
        // when this method gets called:
        // res will equal 'hello'; arg will equal 'argument'
        // 'this' will === myObj
    }
    
    myObj().foo()
           .bar('argument');

You may mix standard promise methods in with your custom methods; Blackbird depends on the promise library Bluebird, so any method provided by Bluebird is available as well.

I have not yet analyzed behavior when interacting between Blackbird and other types of promises. Blackbird promises should work fine as thenables (be acceptable to other promises), but if you use a standard promise you will not be able to access your extended methods, of course. To help keep things consistent, the Promise object used by the Blackbird object is exported:

    var MyCoolThing = require('mycoolthing'),
        Promise = MyCoolThing.Promise;

(assuming 'MyCoolThing' is the result of an API built on Blackbird!)

# How to use!

This is likely to change soon, but for now here's how you do it:

    var Blackbird = require('blackbird');

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

        Promise.extend('myCoolMethod'); // <- important!

        return MyCoolThing; // don't forget this!
    });

`Promise.extend` is the part that enables you to chain your custom object's method calls onto promises naturally. It has an alternate syntax:

    Promise.extend('method', function () {});

This allows you to bind a function directly rather than implicitly use the prototype of the object you return.
    
Now, to use the class you just made:

    var Cool = require('./mycoolthing');

    Cool('hello!').myCoolMethod().then(function () {
        console.log('done!');
    });

# Delayed execution

A simple change in `mycoolthing.js`:

    var Blackbird = require('blackbird');

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
    
        Promise.bindStatics(); // <- note here!

        return MyCoolThing;
    });

And now we can do this:

    var Cool = require('./mycoolthing');

    var res = Cool.myCoolMethod().then(function () {
        console.log('done!');
    });
    console.log('...');
    res();

Note that I did not execute `Cool`, I called a static method on it instead. When enabled, this causes your Blackbird object to save up the entire promise chain and return a function that will execute it at a later time. Beware, this also means that all arguments will be evaluated immediately, not at execution time!

The primary reason for this function is so that you can do something like this:

    Cool()
    .myCoolMethod()
    .butWaitTheresMore(
        Cool.myOtherCoolMethod()
            .someMorePromiseStuff()
    );

In this case, you can avoid writing more closures; without it, you would be writing something like this:

    Cool()
    .myCoolMethod()
    .butWaitTheresMore(function () {
        return Cool().myOtherCoolMethod()
                     .someMorePromiseStuff();
    });

You can decide whether to use it or not; by default it is not enabled.
