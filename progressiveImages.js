/**
 * Created by asiulik on 2017-03-02.
 */

( function (window, factory) {

    'use strict';

    if (typeof define == 'function' && define.amd) {
        define([
            'jquery',
            'lodash'
        ], factory);
    } else if (typeof module == 'object' && module.exports) {
        module.exports = factory();
    } else {
        window.progressiveImages = factory();
    }

}(window, function ($, _) {

    var IMAGE_STRATEGY = 'image',
            POSTER_STRATEGY = 'poster',
            LINK_STRATEGY = 'href',
            BACKGROUND_STRATEGY = 'background';

    var avalaibleStrategy = [
                IMAGE_STRATEGY,
                BACKGROUND_STRATEGY,
                POSTER_STRATEGY,
                LINK_STRATEGY
            ],
            attrNameSlug = 'progressive-image-src',
            positionAttrSlug = 'focus-image-config',
            progressiveImageVisibleClass = 'progressive__image--visible',
            isLazyLoadStrategy = false;

    var breakpoints = ["none", "w360", "w480", "w768", "w768@2x", "w1280", "w1280@2x", "w1920", "w2560", "w3840"];

    var Utils = {
        isElementInView: function (element, fullyInView) {

            var pageTop = $(window).scrollTop();
            var pageBottom = pageTop + $(window).height();
            var elementTop = $(element).offset().top;
            var elementBottom = elementTop + parseInt($(element).css('height'));

            if (fullyInView === true) {
                return ((pageTop < elementTop) && (pageBottom > elementBottom));
            } else {
                return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
            }

        },
        setBgImage: function (element, src) {

            if (element) {
                element.style.backgroundImage = 'url("' + src + '")';
                return element;
            }

        },
        getBreakpoint: function () {

            return window.getComputedStyle(document.body, ":after")
            .getPropertyValue("content")
            .replace(/\"|\'/g, "");
        }
    };

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

        var _this = this;
        this.progressiveImages = [];

        this.addItems(progressiveItems);

    };

    Images.prototype.getProgressiveItems = function (container) {
        return container.querySelectorAll('[' + attrNameSlug + ']');
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
                IMAGE_STRATEGY : BACKGROUND_STRATEGY;
    };

    Images.prototype.checkBreak = function () {

        [].forEach.call(this.progressiveImages, function (image) {
            image.checkBreakpoint();
        })

    };

    function ProgressiveImage(el, options) {
        this.element = el;
        this.options = _.assign(this.options, options || {});
    }

    ProgressiveImage.prototype.options = {

        requestOnVisible: true,
        strategy: "image",
        breakpoints: breakpoints

    };

    ProgressiveImage.prototype.createBreakpointConfig = function (breakpointObj, progressiveImageConfig) {

        var arrFromAttr = progressiveImageConfig.split(',');

        _.each(arrFromAttr, function (value) {

            var splited = value.split(" ");

            if (arrFromAttr[0] === 'none')
                isLazyLoadStrategy = true;

            breakpointObj[splited[0]] = splited[1];

        });

        return breakpointObj;

    };

    ProgressiveImage.prototype.init = function (layoutInstance) {

        this.$element = $(this.element);
        this.breakpointsConfigObj = {};

        var _this = this;

        this.breakpointsConfigObj.none = getUrl(this.element, this.options.strategy);

        this.createBreakpointConfig(this.breakpointsConfigObj, this.element.getAttribute(attrNameSlug))

        this.setPositionConfig();

        if (!this.options.requestOnVisible) {
            this.checkBreakpoint();
        }

        this.$element = $(this.element);

        layoutInstance.on('reload', function () {
            _this.checkBreakpoint();
        });

        this.checkViewportTh = function () {

            if (_this.visible) return;
            //if(_this.$element.closest('.slider__item').hasClass('slider__item--hidden')) return;

            var isInViewport = _this.isElementInView(_this.$element);

            if (isInViewport) {

                _this.visible = true;
                _this.checkBreakpoint();

            }
        };

        this.checkViewportTh();

        $(window).on('scroll load', this.checkViewportTh);
        $(window).on('resize', this.checkViewportTh);

    };

    ProgressiveImage.prototype.setPositionConfig = function () {

        var _this = this;
        var arrBgPosition = this.element.getAttribute(positionAttrSlug);

        if (arrBgPosition) {

            this.positionConfig = {};

            arrBgPosition.split(',').map(function (item) {

                var configPair = item.split(' ');

                _this.positionConfig[configPair[0]] = {
                    x: configPair[1].split("/")[0],
                    y: configPair[1].split("/")[1]
                };
            });
        }
    };

    ProgressiveImage.prototype.getAvailableBreakpoint = function (breakpointValue, breakpointsConfig, availableBreakpointsCollection) {

        var breakpoint;
        var availableBreakpoints = availableBreakpointsCollection;

        if (!breakpointsConfig[breakpointValue]) {
            for (var t = availableBreakpoints.indexOf(breakpointValue); t >= 0; t--)
                if ("undefined" != typeof breakpointsConfig[availableBreakpoints[t]]) {
                    breakpoint = availableBreakpoints[t];
                    break
                }
        } else {
            breakpoint = breakpointValue;
        }

        return breakpoint;

    };

    ProgressiveImage.prototype.getImage = function (breakpointValue) {

        var _this = this;

        var breakpoint = this.getAvailableBreakpoint(
                breakpointValue,
                this.breakpointsConfigObj,
                this.options.breakpoints
        );

        var newImg = new Image;

        if (_this.positionConfig) {
            var position = this.positionConfig[breakpoint] || this.positionConfig['none'];
            updatePosition(this.element, this.options.strategy, position);
        }

        if (this.options.forceUpdate) {
            updateSrc(this.breakpointsConfigObj[breakpoint], _this.element, _this.options.strategy);
        }

        newImg.src = this.breakpointsConfigObj[breakpoint];

        newImg.onload = function () {
            updateSrc(newImg.src, _this.element, _this.options.strategy);
        };

    };

    ProgressiveImage.prototype.checkBreakpoint = function () {

        if (this.options.requestOnVisible && !this.visible) return;

        if (this.currentBreakPoint !== getBreakpoint()) {
            this.currentBreakPoint = getBreakpoint();
            this.getImage(this.currentBreakPoint);
        }

    };

    ProgressiveImage.prototype.delete = function () {
        if (this.checkViewportTh) {
            $(window).off('scroll', this.checkViewportTh);
            $(window).off('resize', this.checkViewportTh);
        }
    };

    function updatePosition(element, strategy, position) {

        if (!position) position = {};

        position.x = position.x || 0.5;
        position.y = position.y || 0.5;

        if (strategy === BACKGROUND_STRATEGY) {

            element.style.backgroundPosition =
                    _mapPositionToPercent(position.x) + ' ' + _mapPositionToPercent(position.y)
        }
    }

    function getStrategyTypeByTagName(tagName) {

        var strategy;

        switch (tagName) {

            case 'IMG':
                strategy = IMAGE_STRATEGY;
                break;

            case 'VIDEO':
                strategy = POSTER_STRATEGY;
                break;

            case 'A':
                strategy = LINK_STRATEGY;
                break;

            default:
                strategy = BACKGROUND_STRATEGY;
        }

        return strategy;

    }

    function updateSrc(src, element) {

        var strategy = getStrategyTypeByTagName(element.tagName);

        if (strategy === IMAGE_STRATEGY) {
            element.src = src;
        }

        if (strategy === LINK_STRATEGY) {
            element.href = src;
        }

        if (strategy === POSTER_STRATEGY) {
            Utils.setBgImage(element, src);
        }

        if (strategy === BACKGROUND_STRATEGY) {
            Utils.setBgImage(element, src);
        }

        return element;
    }

    function getUrl(element, strategy) {

        if (strategy === IMAGE_STRATEGY) {
            return element.src;
        }

        if (strategy === BACKGROUND_STRATEGY) {
            var backgroundImage = element.style.backgroundImage;
            return backgroundImage.slice(4, -1).replace(/["|']/g, "");
        }

        throw new Error('Get url invalid strategy detected: ', strategy);
    }

    function _mapPositionToPercent(value) {
        return value * 100 + '%';
    }

    function getBreakpoint() {
        return Utils.getBreakpoint();
    }

    return Images;

}));
