#!/bin/bash

#------------------------------------------------------------------------------
# NAME
#         php-unittest.sh
#
# SYNOPSIS
#         php-unittest.sh
#
# LICENSE
#        Placed in the Public Domain by Mannheim University Library in 2016
#
# DESCRIPTION
#        Check PHP files for code standard conformance using PHP_CodeSniffer
#
#        Will use phpunit(1) if is found in the $PATH or download the
#        PHPUnit PHAR to the directory of the script and
#        execute it using the system's php(1).
#
# SEE ALSO
#        phpunit(1), php(1)
#------------------------------------------------------------------------------

DIR="$(dirname "$(readlink -f "$0")")"
PHPUNIT_PHAR="$DIR/phpunit.phar"
PHPUNIT_URL='https://phar.phpunit.de/phpunit.phar'

[[ -z "$*" ]] && { echo "No arguments given"; exit 0; }
PHPUNIT=$(which phpunit)
if [[ -z "$PHPUNIT" ]];then
    which 'curl' >/dev/null || { echo "Please install curl."; exit 0; }
    which 'php' >/dev/null || { echo "Please install php."; exit 0; }
    [[ ! -e "$PHPUNIT_PHAR" ]] && { curl -Lo "$PHPUNIT_PHAR" "$PHPUNIT_URL"; }
    [[ ! -e "$PHPUNIT_PHAR" ]] && { echo "PHPUnit not available"; exit 0; }
    PHPUNIT="php $PHPUNIT_PHAR"
fi

$PHPUNIT "$@"
