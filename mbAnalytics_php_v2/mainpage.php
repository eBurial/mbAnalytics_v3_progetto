<?php
include("sessionMedico.php");

require_once("dbMotorbrainMaschera.php");

if (isset($_POST["languages"])) {
    // Aggiorno la lingua di visualizzazione
    updateLanguageByMedicoId($medicoSessione["medicoID"], $_POST["languages"]);

    // Recupero il medico aggiornato
    $medicoSessione = getMedicoAttivoByEmail($emailLogin_controllo);
}

?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Main Page</title>

        <!-- Fogli di stile per i vari componenti -->
        <link rel="stylesheet" type="text/css" href="./style_css/style_container.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_menu.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_controls.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_table.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_settings.css">

        <?php
        switch ($medicoSessione["lastLanguage"]) {
            case "IT":
                echo '<script type="text/javascript" src="./script_js/type_definition_ita.js"></script>';
                break;
            case "EN":
                echo '<script type="text/javascript" src="./script_js/type_definition_eng.js"></script>';
                break;
            default:
                echo '<script type="text/javascript" src="./script_js/type_definition_ita.js"></script>';
                break;
        }
        ?>

        <!-- jQuery library -->
        <script type="text/javascript" src="https://code.jquery.com/jquery-1.12.4.js"></script>

        <script>
            $(document).ready(function() {

                // Quando la pagina viene caricata

                // Nascondo il contenuto della sezione impostazioni
                $("#impostazioni").hide();

                // Nascondi tutti i contenuti delle tabs
                $(".contenuto-tab").hide(); 
                // Attiva la prima tab
                $("ul.tabs li:first").addClass("active").show();
                //Mostra il contenuto della prima tab 
                $(".contenuto-tab:first").show();

                // Al click sulla tab
                $("ul.tabs li").click(function() {

                    //Rimuovi ogni classe "active"	
                    $("ul.tabs li").removeClass("active");
                    //E aggiungila solo a quella su cui ho cliccato 
                    $(this).addClass("active");
                    //Nascondi tutti i contenuti delle tab
                    $(".contenuto-tab").hide(); 

                    //Trova l'href per identificare in modo univoco la tab ed il contenuto
                    var activeTab = $(this).find("a").attr("href"); 
                    //Mostrami quest'ultimo con effetto di fadeIn
                    $(activeTab).fadeIn(); 
                    return false;
                });

                $("#bt-nuova-maschera").on("click", function() {
                    window.location.href = './pannelloGrafici.php';
                });

                // Evento collegato al bottone per eliminare la maschera
                $(".bt-elimina-maschera").on("click", function() {

                    // Memorizzo il bottone
                    var btEliminaMaschera = $(this);
                    // Recupero l'id
                    var idMaschera = $(this).attr("id").replace("bt-elimina-maschera-", "");	
                    // Memorizzo il parent
                    var parentCorrente = $(this).parent();	
                    $.post("gestioneGrafici.php", {
                        "elimina_maschera": idMaschera
                    }, function() {
                        $("#tbl-row-" + idMaschera).fadeOut(1000, function() {
                            $(this).remove();
                        });
                    }).fail(function(xhr, ajaxOptions, thrownError) { //Se ci sono errori
                        alert(thrownError); //Messaggio di avviso con l'errore HTTP
                    });

                });

                $(".impostazioni").on("click", function() {
                    $("#home").hide();
                });

                $(".home").on("click", function() {
                    $("#impostazioni").hide();
                });

                <?php echo '$(\'.languages option[value="' . $medicoSessione["lastLanguage"] . '"]\').attr("selected", true);' ?>

                // Setto tutte le stringhe della pagina
                $(".impostazioni > a").text(mainpageArray.settings);
                $(".container-welcome").prepend(mainpageArray.welcome);
                $(".container-info-maschere").text(mainpageArray.noMasks);
                $(".container-text-lavori").text(mainpageArray.works);
                $(".container-bt-nuova-maschera > button").text(mainpageArray.newMask);
                $("#title").text(mainpageArray.title);
                $("#description").text(mainpageArray.description);
                $(".bt-carica-maschera").val(mainpageArray.display);
                $(".bt-elimina-maschera").text(mainpageArray.delete);
                $("#language").text(settingsArray.language);
                $('select option[value="IT"]').text(settingsArray.italian);
                $('select option[value="EN"]').text(settingsArray.english);
                $(".bt-languages").val(settingsArray.change);

            });
        </script>

    </head>
    <body>		
        <ul class="tabs">
            <li class="home"><a href="#home">Home</a></li>
            <li class="impostazioni"><a href="#impostazioni"></a></li>
            <li class="right-element"><a href="./logoutMedico.php">Logout</a></li>
        </ul>
        <div id="contenitore-tabs">
            <div id="home" class="contenuto-tab">
                <div class="container-welcome">
                    <?php echo " Dott. " . $medicoSessione["cognome"] . " " . $medicoSessione["nome"]; ?>
                </div>				
                <div id="contenitore-tbl-maschere">

                    <div>
                        <div class="container-text-lavori"></div>
                        <div class="container-bt-nuova-maschera">
                            <button id="bt-nuova-maschera" class="bt-positive"></button>
                        </div>
                    </div>

                    <?php 		
                    // Recupero le maschere
                    $maschere = getMaschereByMedicoID($medicoSessione["medicoID"]);

                    if (isset($maschere))
                    {
                        if (empty($maschere))
                        {
                            echo '<div class="container-info-maschere">';
                            echo '</div>';
                        }
                        else 
                        {
                            echo '<div id="tbl-maschere" class="tbl-standard">';
                            echo '<div class="tbl-header">';
                            echo '<div id="title" class="tbl-cell-header tbl-cell-max-width">';
                            echo '</div>';
                            echo '<div id="description" class="tbl-cell-header tbl-cell-max-width">';
                            echo '</div>';
                            echo '<div class="tbl-cell-header tbl-cell-min-width">';
                            echo '';
                            echo '</div>';
                            echo '<div class="tbl-cell-header tbl-cell-min-width">';
                            echo '';
                            echo '</div>';
                            echo '</div>';

                            foreach ($maschere as $maschera) {
                                echo '<div id="tbl-row-' . $maschera["mascheraID"] . '" class="tbl-row">';
                                echo '<div class="tbl-cell tbl-cell-max-width">';
                                echo $maschera["titolo"];
                                echo '</div>';
                                echo '<div class="tbl-cell tbl-cell-max-width">';
                                echo $maschera["descrizione"];
                                echo '</div>';
                                echo '<div class="tbl-cell tbl-cell-min-width">';
                                echo '<form action="./pannelloGrafici.php" method="post">';
                                echo '<input type="hidden" id="maschera-id" ';
                                echo 'name="maschera-id" value="' . $maschera["mascheraID"] . '">';
                                echo '<input class="bt-carica-maschera bt-tbl bt-blue" ';
                                echo 'type="submit" name="visualizza-maschera" value="Visualizza">';
                                echo '</form>';
                                echo '</div>';
                                echo '<div class="tbl-cell tbl-cell-min-width tbl-cell-right">';
                                echo '<button id="bt-elimina-maschera-' . $maschera["mascheraID"] . '"';
                                echo ' type="button" class="bt-elimina-maschera bt-tbl bt-red"></button>';
                                echo '</div>';
                                echo '</div>';
                            }

                            echo '</div>';

                        }
                    }
                    ?>
                </div>
            </div>

            <div id="impostazioni">
                <div id="container-impostazioni">
                    <div class="container-settings"></div>
                    <div id="contenitore-tbl-settings">
                        <div id="tbl-settings">
                            <div id="language" class="tbl-cell tbl-cell-width container-settings"></div>
                            <div class="tbl-cell tbl-cell-width container-settings-right">
                                <form method="post" action="./mainpage.php">
                                    <select class="languages" name="languages">
                                        <option value="IT"></option>
                                        <option value="EN"></option>
                                    </select>
                                    <input class="bt-languages" type="submit" value="Cambia">
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </body>
</html>