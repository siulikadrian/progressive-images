(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['jquery', 'lodash'], factory);
    } else {
        // Browser globals.
        root.mylib = factory(root.$, root._);
    }
}(this, function($) {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("node_modules/almond/almond", function(){});

/**
 * Created by asiulik on 2017-03-06.
 */
define('src/config',[], function () {

    var config = {};

    config.IMAGE_STRATEGY = 'image';
    config.LINK_STRATEGY = 'href';
    config.POSTER_STRATEGY = 'poster';
    config.BACKGROUND_STRATEGY = 'background';

    config.avalaibleStrategy = [
        config.IMAGE_STRATEGY,
        config.BACKGROUND_STRATEGY,
        config.POSTER_STRATEGY,
        config.LINK_STRATEGY
    ];

    config.attrNameSlug = 'progressive-image-src';
    config.positionAttrSlug = 'focus-image-config';
    config.progressiveImageVisibleClass = 'progressive__image--visible';
    config.isLazyLoadStrategy = false;

    config.breakpoints = ["none", "w360", "w480", "w768", "w768@2x", "w1280", "w1280@2x", "w1920", "w2560", "w3840"];

    return config;

});
/**
 * Created by asiulik on 2017-03-06.
 */

define('src/utils/inViewport',[], function(){

   return function isElementInViewport(element, fullyInView){

       var pageTop = $(window).scrollTop();
       var pageBottom = pageTop + $(window).height();
       var elementTop = $(element).offset().top;
       var elementBottom = elementTop + parseInt($(element).css('height'));

       if (fullyInView === true) {
           return ((pageTop < elementTop) && (pageBottom > elementBottom));
       } else {
           return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
       }

   }

});
/**
 * Created by asiulik on 2017-03-06.
 */

define('src/utils/setBgImage',[], function(){

    return function setBgImage(element, src) {

        if (element) {
            element.style.backgroundImage = 'url("' + src + '")';
            return element;
        }

    }

});
/**
 * Created by asiulik on 2017-03-06.
 */
define('src/utils/getBreakpoint',[], function(){

    return function getBreakpoint(){

        return window.getComputedStyle(document.body, ":after")
        .getPropertyValue("content")
        .replace(/\"|\'/g, "");

    }

});
/**
 * Created by asiulik on 2017-03-06.
 */

define('src/utils/utils',[
        './inViewport',
        './setBgImage',
        './getBreakpoint'
], function(isElementInView, setBgImage, getBreakpoint){

    return {
        isElementInView: isElementInView,
        setBgImage: setBgImage,
        getBreakpoint: getBreakpoint
    };
    
});

/**
 * Created by asiulik on 2017-03-06.
 */
define('src/image',[
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

        requestOnVisible: true,
        strategy: "image",
        breakpoints: Config.breakpoints,
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
/**
 * Created by asiulik on 2017-03-02.
 */

define('src/images',[
    'jquery',
    'lodash',
    './config',
    './image',
    './utils/utils'
], function ($, _, Config, ProgressiveImage, Utils){

    function Images(options) {
        _this.globalOptions = options;
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

            var prorgessiveItem = new ProgressiveImage(progressiveElement, _.assign(_this.globalOptions, config, {
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

});



    define('jquery', function() {
        return $;
    });

    define('lodash', function() {
        return _;
    });

    return require('src/images');

}));
