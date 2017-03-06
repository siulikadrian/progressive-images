(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['jquery', 'lodash'], factory);
    } else {
        // Browser globals.
        root.mylib = factory(root.$, root._);
    }
}(this, function($) {