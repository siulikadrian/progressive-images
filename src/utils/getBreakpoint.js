/**
 * Created by asiulik on 2017-03-06.
 */
define([], function(){

    return function getBreakpoint(){

        return window.getComputedStyle(document.body, ":after")
        .getPropertyValue("content")
        .replace(/\"|\'/g, "");

    }

});