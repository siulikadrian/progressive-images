/**
 * Created by asiulik on 2017-03-06.
 */
requirejs.config({
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        lodash: '../bower_components/lodash/dist/lodash',
        progressiveImages: '../bower_components/prorgessiveImages/progressiveImages.min'
    },
    shim: {

    }
});

require(['progressiveImages'], function (ProgressiveImages) {

    console.log('ProgressiveImages constructor', ProgressiveImages);
    var progressiveImages = new ProgressiveImages();
    progressiveImages.init();

    console.log('instnace of progressive imahes', progressiveImages);

});