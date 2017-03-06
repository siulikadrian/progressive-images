/**
 * Created by asiulik on 2017-03-06.
 */

define([
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
