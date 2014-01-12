'use strict';

var bluebird = require(
    require.resolve('bluebird')
           .replace(/bluebird\.js$/, 'promise.js')
);

module.exports = createPromise;

function createPromise(cb) {
    // calling code should extend Promise from within the callback
    // and return a constructor for the custom object being wrapped
    var Promise = promiseFactory();
    var Constructor = cb(Promise);
    
    // instantiates a new object (custom object defined above)
    // calls the constructor on it, and returns a promise
    // bound to that new object
    var Blackbird = function () {
        var obj = Object.create(Constructor.prototype);
        var res = Constructor.apply(obj, arguments);
        return function () { return Promise.resolve(obj).bind(obj); }
    };
    Blackbird.Promise = Promise;
    return Blackbird;
}

function promiseFactory() {
    // create a new Promise constructor
    var sub = bluebird();
    
    // add a static method to extend it with new sugar methods
    sub.extend = function(method, fn) {
        if (typeof fn === 'undefined') { fn = method; }
        if (typeof fn === 'function') {
            this.prototype[method] = function () {
                var $_len = arguments.length;var args = new Array($_len + 1); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i + 1] = arguments[$_i];}
                var bound = this._isBound() ? this._boundTo : null;
                    
                // target function is specified explicitly
                // function fn (res[, args...]) { }
                // Promise.resolve(res).fn([args...]);
                return this._then(function(obj) {
                        args[0] = obj;
                        return fn.apply(bound, args);
                    },
                    void 0,
                    void 0,
                    void 0,
                    void 0,
                    this[method]
                );
            }
        } else if (typeof fn === 'string') {
            this.prototype[method] = function () {
                var $_len = arguments.length;var args = new Array($_len + 1); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i + 1] = arguments[$_i];}
                var bound = this._isBound() ? this._boundTo : null;
                    
                // target function is a method name of bound object
                // Foo.prototype.fn = function (res[, args...]) { }
                // Promise.bind(new Foo()).return(res).fn([args...]);
                if (bound === null) {
                    throw new TypeError("Cannot call method '" + method + "': no target bound to promise");
                }
                return this._then(function(obj) {
                        args[0] = obj;
                        return bound[fn].apply(bound, args);
                    },
                    void 0,
                    void 0,
                    void 0,
                    void 0,
                    this[method]
                );
            };
        } else {
            throw new TypeError('.extend requires a function or method name for the second argument');
        }

        return this;
    };
    return sub;
};
