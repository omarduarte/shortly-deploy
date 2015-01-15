module.exports = function(grunt) {

  var azureSiteName = 'omarduarte-shortly';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';'
      },
      lib: {
        src: ['public/lib/jquery.js','public/lib/underscore.js', 'public/lib/handlebars.js', 'public/lib/backbone.js'],
        dest: 'public/dist/lib/lib.js'
      },
      app: {
        src: ['public/client/app.js', 'public/client/link.js', 'public/client/links.js', 'public/client/linkView.js', 'public/client/linksView.js', 'public/client/createLinkView.js', 'public/client/router.js'],
        dest: 'public/dist/client/app.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      lib : {
        src:  'public/dist/lib/lib.js',
        dest: 'public/dist/lib/lib.min.js'
      },
      app: {
        src:  'public/dist/client/app.js',
        dest: 'public/dist/client/app.min.js'
      }
    },

    jshint: {
      all: ['public/client/*.js'],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      target: {
        files: {
          'public/dist/style.min.css': ['public/style.css']
        }        
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      scaleUpAzure: {
        command: 'azure site scale mode standard ' + azureSiteName
      },
      // log: {
      //   command: 'azure site log tail ' + azureSiteName + ' > azurelog &'
      // },
      pushToAzure: {
        command: 'git push azure master'
      },
      scaleDownAzure: {
        command: 'azure site scale mode free ' + azureSiteName
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', ['concat', 'uglify', 'cssmin']);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      grunt.task.run(['shell:scaleUpAzure', 'shell:pushToAzure', 'shell:scaleDownAzure']);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
    'build','test', 'jshint', 'upload'
  ]);

};
