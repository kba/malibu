<?php
/*
 * Copyright (C) 2013 Universitätsbibliothek Mannheim
 *
 * Author:
 *    Philipp Zumstein <philipp.zumstein@bib.uni-mannheim.de>
 *
 * This is free software licensed under the terms of the GNU GPL,
 * version 3, or (at your option) any later version.
 * See <http://www.gnu.org/licenses/> for more details.
 *
 */

function isbn13to10($z)
{
    if (strlen($z) == 13) {
        $t = '';
        for ($i = 0; $i < 10; $i++) {
            $t .= $i * substr($z, $i+3, 1);
        }
        $t %= 11;
        if ($t == 10) {
            $t = 'X';
        }
        return substr($z, 3, 9) . $t;
    } else {
        return $z;
    }
}

function isbn10to13($z)
{
    if (strlen($z) == 10) {
        $z = '978' . substr($z, 0, 9);
        $t = (10 - ((substr($z, 0, 1) . 3 * substr($z, 1, 1) . substr($z, 2, 1) . 3 * substr($z, 3, 1) .
                     substr($z, 4, 1) . 3 * substr($z, 5, 1) . substr($z, 6, 1) . 3 * substr($z, 7, 1) .
                     substr($z, 8, 1) . 3 * substr($z, 9, 1) . substr($z, 10, 1) . 3 * substr($z, 11, 1)) % 10)) % 10;
        return $z . $t;
    } else {
        return $z;
    }
}
