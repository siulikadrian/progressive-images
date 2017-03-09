/**
 * Created by asiulik on 2017-03-06.
 */
requirejs.config({
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        lodash: '../bower_components/lodash/dist/lodash',
        progressiveImages: '../bower_components/prorgessiveImages/progressiveImages.min'
    }
});

require(['progressiveImages'], function (ProgressiveImages) {

    var progressiveImages = new ProgressiveImages({

        isElementInView: function($element) {
            console.log('custom isElement in viewport', $element);
            return true;
        }
        
    });

    progressiveImages.init();

});