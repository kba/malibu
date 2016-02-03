<?php

require_once('tools/isbnUtils.php');

class IsbnUtilsTest extends PHPUnit_Framework_TestCase
{

    public function test13to10()
    {
        $this->assertEquals('3821810416', isbn13to10('3821810416'));
        // $this->assertEquals('080442957X', isbn10('978080442957X'));
    }
}
