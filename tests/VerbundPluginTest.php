<?php

require_once('isbn/plugin/VerbundPlugin.php');

class MockPlugin extends VerbundPlugin
{
    public function __construct($url='http://mock', $user='', $password='', $syntax='marc21', $elementset='F')
    {
        parent::__construct($url, $user, $password, $syntax, $elementset);
    }

    public function name()
    {
        return 'mock';
    }
}

class VerbundPluginTest extends PHPUnit_Framework_TestCase
{
    public function testConstructor()
    {
        $it = new MockPlugin();
        $this->assertEquals('mock', $it->name());
        $this->assertEquals('http://mock', $it->url);

        $it = new MockPlugin('bar');
        $this->assertEquals('mock', $it->name());
        $this->assertEquals('bar', $it->url);
    }

}
