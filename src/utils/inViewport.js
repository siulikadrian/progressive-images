/**
 * Created by asiulik on 2017-03-06.
 */

define([], function(){

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