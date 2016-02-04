<?php

abstract class VerbundPlugin
{

    public $url;
    public $user;
    public $password;
    public $syntax;
    public $elementset;

    abstract function name();
    abstract searchPPN($yaz_id, $ppn);
    abstract searchISBN($yaz_id, $isbn);

    public function __construct($url, $user='', $password='', $syntax='marc21', $elementset='F')
    {
        $this->url = $url;
        $this->user = $user;
        $this->password = $password;
        $this->syntax = $syntax;
        $this->elementset = $elementset;
    }

    protected connect($rangeMin=1, $rangeMax=10)
    {
        $id = yaz_connect($this->url, array("user" => $this->user, "password" => $this->password));
        yaz_syntax($id, $this->syntax);//
        yaz_range($id, $rangeMin, $rangeMax);
        yaz_element($id, $this->elementset); //
        return $id;
    }

    protected fetchResults($yaz_id)
    {
        yaz_wait();
        $error = yaz_error($id);
        if (!empty($error)) {
            echo "Error Number: " . yaz_errno($id);
            echo "Error Description: " . $error ;
            echo "Additional Error Information: " . yaz_addinfo($id);
        }
    }
}
