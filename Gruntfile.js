module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-requirejs');

    var taskConfig = {
        requirejs: {
            build: {
                options: {
                    name: 'images',
                    optimize: 'uglify2',
                    wrap: {
                        startFile: 'node_modules/requirejs/require.js'
                    },
                    paths: {
                        jquery: "empty:",
                        lodash: "empty:"
                    },
                    baseUrl: 'src',
                    mainConfigFile: 'src/images.js',
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