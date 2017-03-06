/**
 * Created by asiulik on 2017-03-02.
 */

( function (window, factory) {

    'use strict';

    if (typeof define == 'function' && define.amd) {
        define([
            'jquery',
            'lodash',
            './config',
            './image',
            './utils/utils'
        ], factory);
    } else if (typeof module == 'object' && module.exports) {
        module.exports = factory(
                require('jquery'),
                require('lodash')
        );
    } else {
        window.progressiveImages = factory(
                window.$,
                window._
        );
    }

}(window, function ($, _, Config, ProgressiveImage, Utils) {

    function Images(layoutInstance) {
        this.layout = layoutInstance;
    }

    Images.prototype.init = function () {

        var progressiveItems = this.getProgressiveItems(document);

        if (this.progressiveImages && this.progressiveImages.length) {
            this.progressiveImages.forEach(function (image) {
                image.delete();
            })
        }

        this.progressiveImages = [];

        this.addItems(progressiveItems);

    };

    Images.prototype.getProgressiveItems = function (container) {
        return container.querySelectorAll('[' + Config.attrNameSlug + ']');
    };

    Images.prototype.addItems = function (collection) {

        var _this = this;

        [].forEach.call(collection, function (progressiveElement) {

            var configString = $(progressiveElement).attr('progressive-image-src-config');
            var config = configString ? JSON.parse(configString.replace(/'/g, '"')) : {};

            var prorgessiveItem = new ProgressiveImage(progressiveElement, _.assign(config, {
                strategy: _this.getStrategyByTag(progressiveElement)
            }));

            prorgessiveItem.init(_this.layout);
            _this.progressiveImages.push(prorgessiveItem)

        });

        return this;

    };

    Images.prototype.getStrategyByTag = function (element) {
        return element.tagName.toLowerCase() === 'image' ?
                Config.IMAGE_STRATEGY : Config.BACKGROUND_STRATEGY;
    };

    Images.prototype.checkBreak = function () {

        [].forEach.call(this.progressiveImages, function (image) {
            image.checkBreakpoint();
        })

    };

    return Images;

}));