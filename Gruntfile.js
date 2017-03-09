module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-requirejs');

    var taskConfig = {
        requirejs: {
            build: {
                options: {

                    optimize: 'uglify2',
                    paths: {
                        "progressiveImages": "src/images",
                        "jquery": "empty:",
                        "lodash": "empty:"
                    },
                    wrap: {
                        "startFile": "src/wrap/start",
                        "endFile": "src/wrap/end"
                    },
                    "include": ["node_modules/almond/almond", "src/images"],
                    "exclude": ["jquery", "lodash"],

                    out: 'progressiveImages.min.js',
                    preserveLicenseComments: false
                }          
            },
            debug: {
                options: {

                    optimize: 'none',
                    paths: {
                        "progressiveImages": "src/images",
                        "jquery": "empty:",
                        "lodash": "empty:"
                    },
                    wrap: {
                        "startFile": "src/wrap/start",
                        "endFile": "src/wrap/end"
                    },
                    "include": ["node_modules/almond/almond", "src/images"],
                    "exclude": ["jquery", "lodash"],

                    out: 'progressiveImages.js'
                }
            }
        }
    };

    grunt.initConfig(taskConfig);

    grunt.registerTask('default', ['requirejs:build', 'requirejs:debug']);
    grunt.registerTask('build', ['requirejs:build', 'requirejs:debug']);

};