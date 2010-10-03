#!/bin/bash

# Javascript builder/packager script
# - Flatten all required js files into a single js.
# - Add version number if supplied.
# - Exclude tests.
# - package in a directory along with any extra assets, such
#   as css files.

# Set this to specify the files to build:

EXT_DIR="js-logger"
  # => build/EXT_DIR-<version-string>/
  # - version_string is set via the build script.
EXT_MAIN="logger"
  # => build/EXT_DIR-<version-string>/EXT_MAIN.js
FILE_ORDER="pretty_print.js Logger.js"
  # List of js files to minifier and squash into a file.
  # eg "file1 file2 file3"
OTHER_FILES=
  # Optional; put other files into EXT_DIR such as
  # css files for packaging with your js.
  # eg "file1 file2 file3"
  # Leave as empty string otherwise.


usage(){
    cat <<-EOF
  1) You must specify FILE_ORDER which is set at the top of this
     script.
  2) You must specify a js minifier program in JSMINIFY variable.
     Use 'cat' if you don't have one.  Make sure it is in your
     environment or set it in this script.
       export JSMINIFY=/path/to/minifier
EOF
}
err2(){
    cat <<-EOF
  Don't think you are in the correct directory.
  Make sure you are in the root directory of this project.
EOF
}

check(){
  test -z "$FILE_ORDER" && usage && return 0
  test -z "$JSMINIFY" && usage && return 0
  test -e "LICENSE" || (err2 && return 0)
  return 1
}



# Usage: build v0.4.3 => build/unitjs-v0.4.3.js
build() {
  check && return 1
  version=$1
  test -n "$version" && version="-${version}"
  dir=build/$EXT_DIR${version}/
  main=$dir/$EXT_MAIN.js

  echo $dir
  mkdir -p $dir
  (echo '/*'; cat COPYING; echo '*/') >$main
  cat $FILE_ORDER |$JSMINIFY >>$main
  test -n "$OTHER_FILES" && cp $OTHER_FILES $dir/
}

build $*
