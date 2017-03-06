module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-requirejs');

    var taskConfig = {
        requirejs: {
            build: {
                options: {

                    optimize: 'none',
                    paths: {
                        "progressiveImages": "src/images",
                        "jquery": "empty:",
                        "lodash": "empty:"
                    },
                    wrap: {
                        "startFile": "src/wrap/start.js",
                        "endFile": "src/wrap/end.js"
                    },
                    "include": ["node_modules/almond/almond", "src/images"],
                    "exclude": ["jquery", "lodash"],

                    out: 'progressiveImages.min.js',
                    preserveLicenseComments: false
                }          
            }
        }
    };

    grunt.initConfig(taskConfig);

    grunt.registerTask('default', ['requirejs:build']);
    grunt.registerTask('build', ['requirejs:build']);

};