(function () {
	
	module.exports = function (grunt) {

		grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),
			less: {
				default: {
					files: {
						"src/_dist/css/styles-app.css": "src/less/main.less"
					}
				}
			},
			watch: {
				options: {
					spawn: false
				},
				css: {
					files: ['src/less/**/*.less', 'src/css/**/*.css'],
					tasks: ['runStyles']
				},
				js: {
					files: ['src/js/**/*.js'],
					tasks: ['runScripts']
				}
			},
			babel: {
				options: {
					sourceMap: false
				},
				dist: {
					files: {
						'src/_dist/js/scripts-app-compiled.js': 'src/_dist/js/scripts-app.js'
					}
				}
			},
			concat: {
				jsapp: {
					src: [
						'src/js/app/*.js',
						'src/js/scripts.js'
					],
					dest: 'src/_dist/js/scripts-app.js'
				},
				jsvendors: {
					src: [
						'src/js/lib/*.js'
					],
					dest: 'src/_dist/js/scripts-lib.js'
				},
				jsall : {
					src: [
						'src/_dist/js/scripts-lib.js',
						'src/_dist/js/scripts-app-compiled.js'
					],
					dest: 'assets/js/scripts.js'
				},
				css: {
					src: [
						'src/css/**/*.css',
						'src/_dist/css/styles-app.css'
					],
					dest: 'src/_dist/css/styles.css'
				}
			},
			jshint: {
				options: {
					'esversion': 6,
				},
				all: [
					'src/js/*.js',
					'src/js/scripts.js'
				]
			},
			postcss: {
				options: {
					grid : 'autoplace',
					map: false,
					processors: [
						require('autoprefixer')({ grid : true }), // add vendor prefixes
					]
				},
				dist: {
					src: 'src/_dist/css/styles.css',
					dest: 'assets/css/styles.css'
				}
			},
			cssmin: { 
				options: {
					report: 'gzip',
					keepSpecialComments: 0
				},
				target: {
					files: [{
						expand: true,
						cwd: 'assets/css',
						src: ['*.css', '!*.min.css'],
						dest: 'assets/css',
						ext: '.min.css'
					}]
				}
			},
			uglify: {
				options: {
					mangle: false,
					report: 'gzip'
				},
				default: {
					files: {
						'assets/js/scripts.min.js': ['assets/js/scripts.js']
					}
				}
			},
			compress: {
				css: {
					options: {
						mode: 'gzip'
					},
					files: [{
						expand: true, 
						src: ['assets/css/*.min.css'], 
						ext: '.min.css.gz'
					}]
				},
				js: {
					options: {
						mode: 'gzip'
					},
					files: [{
						expand: true, 
						src: ['assets/js/**/*.min.js'], 
						ext: '.min.js.gz'
					}]
				}
			}
		});

		// load tasks
		// grunt.loadNpmTasks('grunt-autoprefixer');
		grunt.loadNpmTasks('grunt-postcss');
		grunt.loadNpmTasks('grunt-contrib-cssmin');
		grunt.loadNpmTasks('grunt-contrib-concat');
		grunt.loadNpmTasks('grunt-contrib-watch');
		grunt.loadNpmTasks('grunt-contrib-less');
		grunt.loadNpmTasks('grunt-babel');
		grunt.loadNpmTasks('grunt-contrib-uglify');
		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-contrib-compress');

		// register task
		grunt.registerTask('runScripts', ['jshint', 'concat:jsapp', 'concat:jsvendors', 'babel', 'concat:jsall', 'uglify', 'compress:js']);
		grunt.registerTask('runStyles', ['less', 'concat:css' ,'postcss' ,'cssmin', 'compress:css']);

		// standard
		grunt.registerTask('default', ['runScripts', 'runStyles']);
	};
})();