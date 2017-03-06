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
        progressiveImages: {
            deps: ['jquery', 'lodash']
        }
}
});

require(['progressiveImages'], function (ProgressiveImages) {

    var progressiveImages = new ProgressiveImages(function Layout(){});
    progressiveImages.init();

});