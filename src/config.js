/**
 * Created by asiulik on 2017-03-06.
 */
define([], function () {

    var config = {};

    config.IMAGE_STRATEGY = 'image';
    config.POSTER_STRATEGY = 'poster';
    config.LINK_STRATEGY = 'href';
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