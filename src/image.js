/**
 * Created by asiulik on 2017-03-06.
 */
define([
    'jquery',
    'lodash',
    './config',
    './utils/utils'
], function ($, _, Config, Utils) {

    function ProgressiveImage(el, options) {
        this.element = el;
        this.options = _.assign(this.options, options || {});
    }

    ProgressiveImage.prototype.options = {

        /*
        *  requestOnVisible make request when isElementInView return true value by currentBreakpoint
        * */
        requestOnVisible: true,
        /*
        *  supported breakpoints collection
        * */
        breakpoints: Config.breakpoints,
        /*
        * isElementInView should return boolean true/false
        * */
        isElementInView: function($element){
            return Utils.isElementInView($element);
        }

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

    ProgressiveImage.prototype.init = function () {

        this.$element = $(this.element);
        this.breakpointsConfigObj = {};

        var _this = this;

        this.breakpointsConfigObj.none = getUrl(this.element, this.options.strategy);

        this.createBreakpointConfig(this.breakpointsConfigObj, this.element.getAttribute(Config.attrNameSlug));

        this.setPositionConfig();

        if (!this.options.requestOnVisible) {
            this.checkBreakpoint();
        }

        this.$element = $(this.element);

        $(window).on('resize orientationchange', function () {
            _this.checkBreakpoint();
        });

        this.checkViewportTh = function () {

            if (_this.visible) return;

            var isInViewport = _this.options.isElementInView(_this.$element);

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
        var arrBgPosition = this.element.getAttribute(Config.positionAttrSlug);

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

        if (strategy === Config.BACKGROUND_STRATEGY) {

            element.style.backgroundPosition =
                    _mapPositionToPercent(position.x) + ' ' + _mapPositionToPercent(position.y)
        }
    }

    function getStrategyTypeByTagName(tagName) {

        var strategy;

        switch (tagName) {

            case 'IMG':
                strategy = Config.IMAGE_STRATEGY;
                break;

            case 'VIDEO':
                strategy = Config.POSTER_STRATEGY;
                break;

            case 'A':
                strategy = Config.LINK_STRATEGY;
                break;

            default:
                strategy = Config.BACKGROUND_STRATEGY;
        }

        return strategy;

    }

    function updateSrc(src, element) {

        var strategy = getStrategyTypeByTagName(element.tagName);

        if (strategy === Config.IMAGE_STRATEGY) {
            element.src = src;
        }

        if (strategy === Config.LINK_STRATEGY) {
            element.href = src;
        }

        if (strategy === Config.POSTER_STRATEGY) {
            Utils.setBgImage(element, src);
        }

        if (strategy === Config.BACKGROUND_STRATEGY) {
            Utils.setBgImage(element, src);
        }

        return element;
    }

    function getUrl(element, strategy) {

        if (strategy === Config.IMAGE_STRATEGY) {
            return element.src;
        }

        if (strategy === Config.BACKGROUND_STRATEGY) {
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

    return ProgressiveImage;

});