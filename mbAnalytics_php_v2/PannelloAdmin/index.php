<?php
include("controllaAccessoAdmin.php");
?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Motorbrain Admin</title>

        <!-- Fogli di stile per i vari componenti -->
        <link rel="stylesheet" type="text/css" href="../style_css/style_menu.css">
        <link rel="stylesheet" type="text/css" href="../style_css/style_container.css">
        <link rel="stylesheet" type="text/css" href="../style_css/style_controls.css">

        <!-- jQuery library -->
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>

        <script>
            $(document).ready(function() {

                // Quando la pagina viene caricata
                // Nascondi tutti i contenuti delle tabs
                $(".contenuto-tab").hide(); 
                // Attiva la prima tab
                $("ul.tabs li:first").addClass("active").show();
                //Mostra il contenuto della prima tab 
                $(".contenuto-tab:first").show(); 

            });
        </script>
    </head>
    <body>		
        <ul class="tabs">
            <li><a href="#login-admin">Pannello di controllo</a></li>
        </ul>
        <div id="contenitore-tabs">
            <div id="login-admin" class="contenuto-tab">
                <p class="p-info-login">Inserisci le credenziali per accedere al pannello di controllo:</p>
                <?php
                if (!empty($errAdminLogin))
                {	
                    echo "<div class=\"messaggio-errore\">";
                    echo $errAdminLogin; 
                    echo "</div>";
                }
                ?>
                <form class="form-admin-login" 
                      action="" 
                      method="post">
                    <input id="txt-username-admin-login" 
                           name="username-admin-login" 
                           class="input-text-login" 
                           placeholder="Username" 
                           type="text">
                    <input id="txt-pwd-admin-login" 
                           name="pwd-admin-login" 
                           class="input-text-login" 
                           placeholder="Password" 
                           type="password">
                    <input class="bt-admin-login" 
                           name="esegui-admin-login" 
                           type="submit" 
                           value="Accedi">
                </form>
            </div>
        </div>
    </body>
</html>
