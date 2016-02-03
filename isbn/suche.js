$(document).ready(function(){
    //Damit werden die Variablen ueber HTML ausgewertet (so wie GET Variablen in PHP)
    if (getParameterByName("isbn")) {
        $('#eingabeIsbn').val(getParameterByName("isbn"));
        $('#eingabePpn').val('');
        isbnEingabe(getParameterByName("isbn"));
    } else if (getParameterByName("ppn")) {
        $('#eingabePpn').val(getParameterByName("ppn"));
        $('#eingabeIsbn').val('');
        if (getParameterByName("verbund")) {
            $("input[name='eingabeVerbund'][value='"+getParameterByName('verbund')+"']").attr("checked","checked");
            ppnEingabe(getParameterByName("ppn"),getParameterByName("verbund"));
        } else {
            ppnEingabe(getParameterByName("ppn"),"SWB");//Wird als Default-Wert gesetzt
        }
    }

    //Aktion bei ISBN Form:
    $('#formIsbn').on('submit', function(){
        var parameter = $('#eingabeIsbn').val();
        window.location = "suche.html?isbn=" + parameter;
        return false;//damit sollte die eigentlich submit action ignoriert werden
    });

    //Aktion bei PPN Form:
    $('#formPpn').on('submit',function(){
        var id = $('#eingabePpn').val();
        var verbund = $('#eingabeVerbund').val();
        window.location = "suche.html?ppn=" + id + "&verbund=" + verbund;
        return false;//damit sollte die eigentlich submit action ignoriert werden
    });

});


function ppnEingabe(ppn, verbund) {
    verbund = verbund.toLowerCase();
    $.getJSON(verbund+".php?ppn="+ppn+"&format=json", function(data){
        if (data['isbn'].length > 0) {
            var isbnString = data['isbn'].join(",");
            isbnEingabe(isbnString);
        } else {
            $('#status').append('Keine zugehörige ISBN gefunden! vgl. <a href="' + Verbund+'2XML.php?ppn='+ppn+'">Details</a>');
        }
    });
}


//mögliche Werte für n:
// - eine 13-stellige ISBN, z.B. 9783830493662
// - eine 10-stellige ISBN, z.B. 3830493665
// - mehrere ISBNs getrennt durch ein Komma, z.B. 9783830493662,3830493665
// - mehrere ISBNs getrennt durch "or" und ggf. Leerzeichen, z.B. 9783830493662 or 3830493665
function isbnEingabe(n) {
    n = n.replace(/or/gi, ',').replace(/\s*/g, '');
    var query="?isbn="+n;

    var nArray = n.split(',');
    $.get("verkaufsinfo.php?isbn13=" + isbn13(nArray[0]), function(data) {
        $('#verkaufsinfo').append(data);
    });

    var suchString = n.replace(/,/g, ' or ');
    $('#status').append("Gesucht wurden ISBN " + suchString);
    $('#suche'+'SWB').html('<a href="http://swb.bsz-bw.de/DB=2.1/SET=1/TTL=1/CMD?ACT=SRCHA&IKT=1016&SRT=YOP&TRM='+suchString+'" target="_blank">SWB</a>');
    $('#suche'+'GBV').html('<a href="http://gso.gbv.de/DB=2.1/SET=1/TTL=1/CMD?ACT=SRCHA&IKT=1016&SRT=YOP&TRM='+suchString+'" target="_blank">GBV</a>');
    $('#suche'+'HEBIS').html('<a href="http://cbsopac.rz.uni-frankfurt.de/DB=2.1/SET=1/TTL=1/CMD?ACT=SRCHA&IKT=6015&SRT=YOP&TRM='+nArray[0]+'" target="_blank">HEBIS</a>');
    $('#suche'+'B3KAT').html('<a href="https://opacplus.bib-bvb.de/TouchPoint_touchpoint/start.do?Query=-1%3D%22' + nArray[0] + '%22&Language=De&SearchProfile=" target="_blank">B3KAT</a>');
    $('#suche'+'HBZ').html('<a href="http://okeanos-www.hbz-nrw.de/F/?FUNC=find-c&CCL_TERM=+IBN=%28'+nArray[0]+'" target="_blank">HBZ</a>');
    $('#suche'+'SWISS').html('<a href="https://www.swissbib.ch/Search/Results?lookfor='+nArray[0]+'&type=AllFields&limit=20&sort=relevance" target="_blank">SWISS</a>');


    // Bestandsabgleich für die UB Mannheim
    // (wird ohne entspechende php-Datei ignoriert)
    // ist aber anpassbar:
    var url = "isbn2MANholdings.php?isbn=" + suchString;
    $.get(url, function(data){
        var pattern = /<div>Holdings in UB Mannheim: ([^\$\n\<]*)/;
        var holdingsMAN = pattern.exec( data );
        if (holdingsMAN) {
             $('#bestandsabgleich').append('<br/><div style="background-color:#ffbbbb">Bestand der UB Mannheim: ' + holdingsMAN[1] + '(<a href="'+url+'" onclick="return toggleHidden()">Details</a>)<div id="detailsText" style="display: none;" class="hidden"><br/></div></div>');
        }
        //TODO alles hier effizienter und besser machen (aber vorerst funktioniert es:-)
        $( "#detailsText" ).load( url.replace(/ /g, '+')+" table" );
    });


    $.getJSON("swb.php"+query+"&format=json", function(data){
        $('#titel').append("<b>"+data["titel"][0] + "</b> <i>" + data["autor"][0] + "</i><br/>");
        if (data["gesamttitel"].length>0) {
            $('#titel').append("("+data["gesamttitel"]+")<br/>");
        }
        if (data["hochschulvermerk"].length>0) {
            $('#titel').append(data["hochschulvermerk"]+"<br/>");
        }
        if (data["isbn"].length>0) {
            $('#titel').append(data["isbn"].join(", ")+"<br/>");
        }

        $('#ausgaben').html('<table class="table">');
        databaseText = 'SWB-Nr.: ';
        var bestandsArray = [];
        $.each(data.einzelaufnahmen, function(key, currentRecord) {
            $('#ausgaben table').append("<tr id='"+currentRecord.id+"'><td>"+currentRecord.id+"<br/><form action='#'><input type='button' value='Bestell Info'/></form></td>");
            $('#'+currentRecord.id).append("<td>"+render(currentRecord.auflage)+"</td>");
            $('#'+currentRecord.id).append("<td>"+render(currentRecord.erscheinungsinfo)+"</td>");
            if (render(currentRecord.produktSigel) == '') {
                $('#'+currentRecord.id).append("<td>"+render(currentRecord.umfang)+"</td>");
            } else {
                $('#'+currentRecord.id).append("<td>"+render(currentRecord.umfang)+' ['+render(currentRecord.produktSigel)+"]</td>");
            }
            $('#'+currentRecord.id).append("<td>"+renderBestandSWB(currentRecord.bestand, currentRecord.id)+"</td>");
            bestandsArray.push(currentRecord.bestand.length);

            $('#'+currentRecord.id+" td:first").click( function() {
                //calling this function directly does not work, see http://stackoverflow.com/questions/447414/calling-a-function-in-jquery-with-click
                bestellInfoFenster(databaseText, currentRecord);
            });

        });

        $('#bestand'+"SWB").append(bestandsArray.join("+"));
        $('#rvk'+'SWB').append( renderRVK(data.rvk) );
        $('#rvk'+'SWB a').each( addBenennung );
        $('#ddc'+'SWB').append( renderDDC(data.ddc) );
        $('#sw'+'SWB').append( renderSW(data.sw) );

        if(data.produktSigel && data.produktSigel.length>0) {
            $('#pda').append( renderPS(data.produktSigel) );
        }

        $('#links').append( renderLinks(data.links) );
        if (data.dnbNr.length>0) {
            $('#links').append( renderLinks( [ "http://d-nb.info/"+data.dnbNr[0] ] ) );
        }
        if (data.oclcNr.length>0) {
            $('#links').append( renderLinks( [ "http://www.worldcat.org/oclc/"+data.oclcNr[0] ] ) );
        }

        //Durch die Asynchronität gib es hier einige Code-Doppelungen --> Sind diese vermeidbar?
        //Falls im SWB keine Titelaufnahme gefunden wird, dann sehen wir im BL Katalog noch nach
        if( $('#ausgaben tr').length == 0 ) {
            $.getJSON("bl.php"+query+"&format=json", function(data){
                $('#titel').html("<b>"+data["titel"][0] + "</b> <i>" + data["autor"][0] + "</i><br/>");
                if (data["gesamttitel"].length>0) {
                    $('#titel').append("("+data["gesamttitel"]+")<br/>");
                }
                if (data["hochschulvermerk"].length>0) {
                    $('#titel').append(data["hochschulvermerk"]+"<br/>");
                }
                if (data["isbn"].length>0) {
                    $('#titel').append(data["isbn"].join(", ")+"<br/>");
                }

                $('#ausgaben').html('<table class="table"></table>');
                databaseText = 'BL-Nr.: ';
                $.each(data.einzelaufnahmen, function(key, currentRecord) {
                    $('#ausgaben table').append("<tr id='"+currentRecord.id+"'><td>"+currentRecord.id+"<br/><form action='#'><input type='button' value='Bestell Info'/></form></td>");
                    $('#'+currentRecord.id).append("<td>"+render(currentRecord.auflage)+"</td>");
                    $('#'+currentRecord.id).append("<td>"+render(currentRecord.erscheinungsinfo)+"</td>");
                    $('#'+currentRecord.id).append("<td>"+render(currentRecord.umfang)+"</td>");
                    $('#'+currentRecord.id).append("<td>"+renderBestandSWB(currentRecord.bestand)+"</td>");

                    $('#'+currentRecord.id+" td:first").click( function() {
                        bestellInfoFenster(databaseText, currentRecord);
                    });

                });

                $('#links').append( renderLinks(data.links) );
            });
        }


    });


    var andereVerbuende = ["GBV", "HEBIS", "B3KAT", "HBZ", "SWISS"];
    $.each(andereVerbuende, function(index, verbund){
        $.getJSON(verbund.toLowerCase()+".php"+query+"&format=json", function(data){

            $('#rvk'+verbund).append( renderRVK(data.rvk) );
            $('#rvk'+verbund+' a').each( addBenennung );
            $('#ddc'+verbund).append( renderDDC(data.ddc) );
            $('#sw'+verbund).append( renderSW(data.sw) );
            $('#links').append( renderLinks(data.links) );
            if (data.dnbNr.length>0) {
                $('#links').append( renderLinks( [ "http://d-nb.info/"+data.dnbNr[0] ] ) );
            }

            if (data.oclcNr && data.oclcNr.length>0) {
                $('#links').append( renderLinks( [ "http://www.worldcat.org/oclc/"+data.oclcNr[0] ] ) );
            }
            var bestandsListe = [];
            for (var i=0; i<data.einzelaufnahmen.length; i++) {
                bestandsListe.push(data.einzelaufnahmen[i].bestand.length);
            }
            $('#bestand'+verbund).append(bestandsListe.join("+"));
            if(data.produktSigel && data.produktSigel.length>0) {
                $('#pda').append( renderPS(data.produktSigel) );
            }
        });
    });

    $('td:empty').each( function() { $(this).html('&nbsp;'); });
}
