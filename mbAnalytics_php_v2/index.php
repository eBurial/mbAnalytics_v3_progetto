<?php
include("controllaAccessoMedico.php");
?> 
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Motorbrain Web</title>

        <!-- Fogli di stile per i vari componenti -->
        <link rel="stylesheet" type="text/css" href="./style_css/style_menu.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_container.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_controls.css">

        <!-- jQuery library -->
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>

        <script>
            $(document).ready(function() {

                var opEseguita = <?php echo '"' . $opEseguita . '"'; ?>;

                // Quando la pagina viene caricata
                // Nascondi tutti i contenuti delle tabs
                $(".contenuto-tab").hide();

                if (opEseguita == "esegui-login") {

                    //Rimuovi ogni classe "active"
                    $("ul.tabs li").removeClass("active");
                    // Attiva la prima tab
                    $("ul.tabs li:first").addClass("active").show();
                    //Mostra il contenuto della prima tab
                    $(".contenuto-tab:first").show();

                } else if (opEseguita == "esegui-registrazione") {

                    //Rimuovi ogni classe "active"
                    $("ul.tabs li").removeClass("active");
                    // Attiva la prima tab
                    $("ul.tabs li:last").addClass("active").show();
                    //Mostra il contenuto della prima tab
                    $(".contenuto-tab:last").show();

                } else {

                    // Attiva la prima tab
                    $("ul.tabs li:first").addClass("active").show();
                    //Mostra il contenuto della prima tab
                    $(".contenuto-tab:first").show();
                }

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
            });
        </script>
    </head>
    <body>
        <ul class="tabs">
            <li><a href="#login">Accedi</a></li>
            <li><a href="#registrazione">Registrati</a></li>
        </ul>
        <div id="contenitore-tabs">
            <div id="login" class="contenuto-tab">
                <p class="p-info-login">Inserisci le tue credenziali per accedere a Motorbrain Web:</p>
                
                <?php
                if (!empty($errLogin))
                {
                    echo "<div class=\"messaggio-errore\">";
                    echo $errLogin;
                    echo "</div>";
                }
                ?> 
                <form class="form-login"
                      action=""
                      method="post">
                    <input id="txt-email-login"
                           name="email-login"
                           class="input-text-login"
                           placeholder="Email"
                           type="text">
                    <input id="txt-pwd-login"
                           name="pwd-login"
                           class="input-text-login"
                           placeholder="Password"
                           type="password">
                    <input class="bt-login"
                           name="esegui-login"
                           type="submit"
                           value="Accedi">
                </form>
            </div>
            <div id="registrazione" class="contenuto-tab">
                <p class="p-info-login">Esegui la registrazione per accedere a Motorbrain Web:</p>
                <?php
                if (!empty($esitoRegistrazione))
                {
                    echo "<div class=\"messaggio-errore\">";
                    echo $esitoRegistrazione;
                    echo "</div>";
                }
                ?>
                <form class="form-login"
                      action=""
                      method="post">
                    <input id="txt-email-registrazione"
                           name="email-registrazione"
                           class="input-text-login"
                           placeholder="Email"
                           type="text"
                           value="<?php echo $emailRegistrazione ?>">
                    <?php
    if (!empty($errEmailRegistrazione))
    {
        echo "<div class=\"messaggio-errore\">";
        echo $errEmailRegistrazione;
        echo "</div>";
    }
                    ?>
                    <input id="txt-nome-registrazione"
                           name="nome-registrazione"
                           class="input-text-login"
                           placeholder="Nome"
                           type="text"
                           value="<?php echo $nomeRegistrazione ?>">
                    <?php
    if (!empty($errNomeRegistrazione))
    {
        echo "<div class=\"messaggio-errore\">";
        echo $errNomeRegistrazione;
        echo "</div>";
    }
                    ?>
                    <input id="txt-cognome-registrazione"
                           name="cognome-registrazione"
                           class="input-text-login"
                           placeholder="Cognome"
                           type="text"
                           value="<?php echo $cognomeRegistrazione ?>">
                    <?php
    if (!empty($errCognomeRegistrazione))
    {
        echo "<div class=\"messaggio-errore\">";
        echo $errCognomeRegistrazione;
        echo "</div>";
    }
                    ?>
                    <input id="txt-pwd-registrazione"
                           name="pwd-registrazione"
                           class="input-text-login"
                           placeholder="Password"
                           type="password">
                    <?php
                    if (!empty($errPwdRegistrazione))
                    {
                        echo "<div class=\"messaggio-errore\">";
                        echo $errPwdRegistrazione;
                        echo "</div>";
                    }
                    ?>
                    <input
                           id="txt-conferma-pwd-registrazione"
                           name="conferma-pwd-registrazione"
                           class="input-text-login"
                           placeholder="Conferma password"
                           type="password">
                    <?php
                    if (!empty($errConfermaPwdRegistrazione))
                    {
                        echo "<div class=\"messaggio-errore\">";
                        echo $errConfermaPwdRegistrazione;
                        echo "</div>";
                    }
                    ?>
                    <input class="bt-login"
                           name="esegui-registrazione"
                           type="submit"
                           value="Registrati">
                </form>
            </div>
        </div>
    </body>
</html>
