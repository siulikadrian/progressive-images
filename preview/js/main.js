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

    var progressiveImages = new ProgressiveImages();
    progressiveImages.init();

    // var progressiveImages = new ProgressiveImages({
    //     /*
    //      *  requestOnVisible, default true. Default value for each progressive images elements.
    //      *  Make request when isElementInView return true value by currentBreakpoint.
    //      * */
    //     requestOnVisible: true,
    //     /*
    //     * forceUpdate, default false. Force replace source, src, background-image to new resource before new resource are loaded.
    //     * Useful for links href attr.
    //     * Can be set for every progressive images by passing this property on progressive-image-src-config
    //     * */
    //     forceUpdate: false,
    //     /*
    //      *  supported breakpoints collection. Should contain all available breakpoints. Should be defined in CSS too.
    //      * */
    //     breakpoints: Config.breakpoints,
    //     /*
    //      * isElementInView should return boolean true/false. Default return true on viewport bottom position.
    //      * */
    //     isElementInView: function($element) {
    //         return true;
    //     }
    //
    // });
    //
    // progressiveImages.init();
    //
    // /*Public API*/
    //
    // /*
    //  * @params: containerNODE eg. document.querySelector('body')
    //  * Return progressiveItems in passed containerNODE
    //  * */
    //
    // progressiveImages.getProgressiveItems(containerNODE);
    //
    // /*
    // * @params: progressiveItems
    // * Can add progressive images programmatically
    // * */
    //
    // progressiveImages.addItems(
    //         progressiveImages.getProgressiveItems(containerNODE)
    // );
    //
    // /*
    // * Force checkBreakpoint for each progressive images.
    // * */
    //
    // progressiveImages.checkBreak();
    //
    // /*
    // * Destroy all progressive images instances.
    // * */
    //
    // progressiveImages.destroyItems();
    //
    // /*
    // *  Improvements
    // *
    // *  - remove dependencies jquery, lodash
    // *  - add events
    // *  - move to es6
    // *
    // * */

});