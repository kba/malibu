<?php
/*
 */

abstract class VerbundAntwort
{

    private $type;

    public function __construct($type)
    {
        if ($type !== 'marc' && $type !== 'mab')
        {
            throw new InvalidArgumentException("'type' must be either 'marc' or 'mab'");
        }
        $this->type = $type;
    }

    abstract public function addField($nr, $type, $value);
}
