(function () {
	
	module.exports = function (grunt) {

		grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),
			less: {
				default: {
					files: {
						"src/build/css/app.build.css": "src/less/main.less"
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
						'src/build/js/app.build-babel.js': 'src/build/js/app.build.js'
					}
				}
			},
			concat: {
				jsapp: {
					src: [
						'src/js/app/*.js',
						'src/js/scripts.js'
					],
					dest: 'src/build/js/app.build.js'
				},
				jsvendors: {
					src: [
						'src/js/lib/*.js'
					],
					dest: 'src/build/js/lib.build.js'
				},
				jsall : {
					src: [
						'src/build/js/lib.build.js',
						'src/build/js/app.build-babel.js'
					],
					dest: 'assets/js/scripts.js'
				},
				css: {
					src: [
						'src/css/**/*.css',
						'src/build/css/app.build.css'
					],
					dest: 'src/build/css/styles.build.css'
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
					src: 'src/build/css/styles.build.css',
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