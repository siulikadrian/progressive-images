/**
 * Created by asiulik on 2017-03-06.
 */

define([], function(){

    return function setBgImage(element, src) {

        if (element) {
            element.style.backgroundImage = 'url("' + src + '")';
            return element;
        }

    }

});