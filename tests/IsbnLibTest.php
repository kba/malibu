<?php

$oldpwd = getcwd();
chdir('isbn');
require_once('lib.php');
chdir($oldpwd);

class IsbnLibTest extends PHPUnit_Framework_TestCase
{

    public function testPrintMabContent()
    {
        $data = "foo\xE2\x80\xA1bar";
        $this->assertEquals('foo<tf/>bar', printMabContent($data));
    }

    public function testPrintLine()
    {
        $expect = '<feld nr="454" ind="b">Süddeutsche Zeitung GmbH &lt;München&gt;: Bibliothek</feld>' . "\n";
        $line = '454bSüddeutsche Zeitung GmbH <München>: Bibliothek';
        $this->assertEquals($expect, printLine($line));
    }

    public function testPrintLineTeilfeld()
    {
        $expect = '<feld nr="454" ind="b">foo<tf/>bar<tf/>foo</feld>' . "\n";
        $line = "454bfoo\xE2\x80\xA1bar\xE2\x80\xA1foo";
        $this->assertEquals($expect, printLine($line));
    }
}
