const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const browserSync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const sourcemaps = require('gulp-sourcemaps');
const del = require('gulp-clean');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');

// Pathes to files
const paths = {
  html: {
    src: 'src/*.html',
    dest: 'dist/',
  },
  scss: {
    src: 'src/sass/**/*.+(scss|sass|css)',
    dest: 'dist/css',
    srcCss: 'src/css',
  },
  js: {
    src: 'src/js/**/*.js',
    dest: 'dist/js',
  },
  images: {
    src: 'src/img/**/*',
    dest: 'dist/img',
  },
  fonts: {
    src: 'src/fonts/**/*',
    dest: 'dist/fonts',
  },
};

// Remove Dist before build process
function clean() {
  return src('dist/*', { read: false }).pipe(del());
}

// Static Server + reload on html files change
function serve() {
  browserSync({
    server: {
      baseDir: paths.html.dest,
    },
  });
}

// Compile css, add prefixes, compress and rename it to .min
function styles() {
  return src(paths.scss.src)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write())
    .pipe(rename('style.css'))
    .pipe(dest(paths.scss.srcCss))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ basename: 'style', suffix: '.min' }))
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// Move the javascript files
// function scripts() {
//   return src(paths.js.src).pipe(dest(paths.js.dest));
// }

// Compress and move html
function html() {
  return src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(dest(paths.html.dest));
}

// Optimize and move images
async function images() {
  return src(paths.images.src).pipe(imagemin()).pipe(dest(paths.images.dest));
}

// Move fonts
// async function fonts() {
//   return src(paths.fonts.src).pipe(dest(paths.fonts.dest));
// }

// Watch for changes and run tasks on change
function watch_dev() {
  watch(paths.scss.src, styles);
  // watch(paths.js.src, scripts).on('change', browserSync.reload);
  watch(paths.html.src, html).on('change', browserSync.reload);
}

exports.clean = clean;
exports.serve = serve;
exports.styles = styles;
exports.html = html;
exports.images = images;

exports.default = series(
  clean,
  parallel(styles, images, html),
  parallel(serve, watch_dev)
);

exports.build = series(clean, parallel(styles, images, html));
