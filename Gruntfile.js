module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                sourceMap: true,
                mangle: true,
                compress: true
            },
            backend: {
                src: [
                    'src/js/back/lightcase.js',
                    'src/js/back/pnotify.custom.js',
                    'src/js/back/sweetalert2.js',
                    'src/js/back/notif.js',
                    'src/js/back/scripts.js',
                    ],
                dest: 'bundle/js/backend-bundle.js'
            },

            frontend: {
                src: [
                    'src/js/front/front-scripts.js',
                ],
                dest: 'bundle/js/frontend-bundle.js'
            },
        },

        watch: {
            concat_js: {
                files: ['src/js/back/*.js', 'src/js/front/*.js'],
                tasks: ['concat']
            },
        },
    });

    // Load the plugin that provides the "uglify" task.
    // grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    grunt.registerTask('default', ['sass']);

};
