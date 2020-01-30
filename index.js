var ecl = "";
var dlCount = 1;
var edit;
var unhandledC = false;
var unhandledF = false;
var isRefreshing = false;
var newWindow;

function printTerminal(out){
    var term = $('#terminal');
    if(term.length){
        term.append(out + "<br>");
        term.stop().animate({
            scrollTop: term[0].scrollHeight
        }, 800);
    }
}

function sanitize(string){
   var doc = new DOMParser().parseFromString(string, 'text/html');
   return doc.body.textContent || "";
}

function newFile(){
    if(edit.getDoc().getValue() == ""){
        edit.getDoc().setValue(
"void main()\n"+
"{\n" +
"    etNew(0);\n" +
"    etSprite(0, ET_RICE, COLOR16_PINK);\n" +
"\n" +
"    etAim(0, AIM_AT);\n" +
"    etCount(0, 2:4:6:8, 2:4:6:8);\n" +
"    etSpeed(0, 3f, 2f);\n" +
"    etAngle(0, 0f, rad(15));\n" +
"\n" +
"    etEx(0, 0, EX_DIST, NEG, NEG, NEGF, NEGF);\n" +
"\n" +
"    while(1)\n" +
"    {\n" +
"        etOffset(0, RANDF2*40f, RANDF2*40f);\n" +
"        etOn(0);\n" +
"        wait(75);\n" +
"    }\n" +
"}\n");
    } else {
        edit.getDoc().setValue("");
    }
}

function toggleTheme(){
    $(".CodeMirror").toggleClass("night");
}

function upload(){
    var button = $("#fileUpload");
    if(button.length) {
        button.trigger('click');
    }
}

function download(){
    $("#download").find('a').get(0).click();
}

function downloadFn(){
    var button = $("#download a");
    if(button.length){
        button.attr("href", URL.createObjectURL(new Blob([edit.getValue()], {type: "text/plain;charset=utf-8;"})));
        button.attr("download", "ECL #"+dlCount+" ("+ new Date().toLocaleDateString('default',{hourCycle:'h24', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'}).replace(":","-") +").ecs");
    } dlCount++;
}

function fullscreen(){
    if(document.fullscreenEnabled) {
        if(newWindow == undefined){
            document.querySelector("#gameWindow").requestFullscreen();
            $("#gameWindow").focus();
        } else {
            newWindow.document.getElementById('html').requestFullscreen();
        }
    } else {
        printTerminal("<span class=\"warning\"><i>Sorry, your browser does not support fullscreen viewing.</i></span>");
    }
}

function windowOpen(){
    newWindow = window.open("game.html", "test", "width=384, height=448, location=no, menubar=no, toolbar=no, titlebar=no");
    $("#game").hide();
    $("#windowClose").show();
    $(".CodeMirror").width("100vw");
    $(".CodeMirror").css("resize","none");

}

function windowClose(){
  newWindow.close();
  gameRestore();
}

function gameRestore(){
    if(isRefreshing) isRefreshing = false;
    else{
        newWindow = undefined;
        $("#game").show();
        $("#windowClose").hide();
        $(".CodeMirror").width("71.5vw");
        $(".CodeMirror").css("resize","both");
    }
}

function clearBullets(){
    unhandledC = true;
}

function updateMedia(){
    if(window.orientation == 0 && /Mobi|Android/i.test(navigator.userAgent)){
        $('#mobile').attr('media', 'all');
    } else {
        $('#mobile').attr('media', '(max-width: 760px)');
    }
}

function restart(){
    if(newWindow == undefined){
        var game = $('#gameWindow');
        if(game.length){
            printTerminal("<span class=\"gameLog\">GAME:</span> <i>Reloading...</i>");
            game.attr('src', function (i, val) {return val;});
        }
    } else {
        printTerminal("<span class=\"gameLog\">GAME:</span> <i>Reloading...</i>");
        windowOpen();
        isRefreshing = true;
    }
}

function down(){
    $('html, body').animate({
        scrollTop: $('html, body').height()
    }, 'smooth');
}

function up(){
    $('html, body').animate({
        scrollTop: 0
    }, 'smooth');
}

function showInfo(event){
    var menu = $("#infoMenu");
    if(menu.length){
        event.stopPropagation();
        menu.show();
        $('#header, #info, #main').css("filter", "brightness(30%)");
        $('#header, #info, #main').on("click touchstart", hideInfo);
    }
}

function hideInfo(){
    var menu = $("#infoMenu");
    if(menu.length){
        menu.hide();
        $('#header, #info, #main').css("filter", "none");
        $('#header, #info, #main').unbind("click touchstart");
    }
}

$(document).ready(function() {
    var socket = io.connect('https://live-ecl-hobby.herokuapp.com/');

    $(".default").click();
    updateMedia();

    $("body").html($("body").html().replace('{VERSION}','1.4.7'));

    edit = CodeMirror.fromTextArea(document.getElementById("edit"), {
    	lineNumbers: true,
    	mode: "text/x-csrc",
    	theme: 'idea',
    	lineWrapping: true,
    	enterMode: "keep",
    	autoRefresh: true,
    	extraKeys: {
                    "Tab": function(cm){
                      cm.replaceSelection("   " , "end");
                    }
                   }
    }); edit.focus();

    $(document).keydown(function(e) {
        if(e.key === "Escape") hideInfo();
        if(e.altKey) {
            switch(e.keyCode){ //todo I
                case 67: //C
                    e.preventDefault();
                    clearBullets();
                    break;

                case 68: //D
                    e.preventDefault();
                    download();
                    break;

                case 69: //E
                    e.preventDefault();
                    printTerminal("<span class=\"warning\">Sorry, the <b>E</b>xternal feature only works when clicking the button.</span>");
                    break;

                case 70: //F
                    e.preventDefault();
                    fullscreen();
                    break;

                case 73: //I
                    e.preventDefault();
                    windowClose();
                    break;

                case 78: //N
                    e.preventDefault;
                    newFile();
                    break;

                case 82: //R
                    e.preventDefault();
                    restart();
                    break;

                case 83: //S
                    e.preventDefault();
                    if(newWindow == undefined){
                        $("#gameWindow").focus();
                    } else {
                        newWindow.focus();
                    }
                    break;

                case 84: //T
                    e.preventDefault();
                    toggleTheme();
                    break;

                case 85: //U
                    e.preventDefault();
                    upload();
                    break;
            }
        }
    });

    var fileReader = new FileReader();
    fileReader.onload = function (){
        edit.setValue(fileReader.result);
    };

    $("#fileUpload").change(function(){
        fileReader.readAsText($('#fileUpload').prop('files')[0]);
    });

    $("#display").click(function(){
        if($("#display").html() == "More.."){
            $(".opt").css("display", "inline-block");
            $("#display").html("Less..");
            $("#display").attr("data-tip", "Click\u00A0to\u00A0see less\u00A0options.");
        } else {
            $(".opt").css("display", "none");
            $("#display").html("More..");
            $("#display").attr("data-tip", "Click\u00A0to\u00A0see more\u00A0options!");
        }
    });

    $("#charTable img").click(function(event){
        if($(this).attr("data-value") != 4){
            $(".selected").removeClass("selected");
            $(this).addClass("selected");
        }
    })

    socket.on('connect', function(){
        var button = $('#button');
        var typingTimer;
        var auto = true;
        var canSend = true;

        printTerminal("<span class=\"no-error\">Server:</span> Connected!");

        socket.emit('sendECL', {val: edit.getValue(),
                                ver: $('#ver').val(),
                                old: $('#old').is(":checked"),
                                s: $('#s').is(":checked")});

        socket.on('stdout', function(data){
            ecl = data;
        });

        socket.on('stderr', function(data){
            printTerminal('<span class=\"separator\">-------</span>' + '<br>' +
                          sanitize(data).replace(/(?:\r\n|\r|\n)/g, '<br>')
                                                  .replace("Fatal errors occurred:", "<span class=\"fatal error\">Fatal errors occurred:</span>")
                                                  .replace("No errors or warnings found!", "<span class=\"no-error\">No errors or war&#8203;nings found!</span>")
                                                  .replace(/invalid/g,"<span class=\"error\">invalid</span>")
                                                  .replace(/warning/g,"<span class=\"warning\">warning</span>")
                                                  .replace(/thecl(:\(stdin\))*/g,"<span class=\"compLog\">Compiler</span>"));
        });

        socket.on('disconnect', function(){
            printTerminal("<span class=\"no-error\">Server:</span> <span class=\"warning\">Disconnected.</span>");
        });


        edit.on("change", function () {
			$("#edit").val(edit.getValue());

            clearTimeout(typingTimer);
            typingTimer = setTimeout(function(){
                if(auto) socket.emit('sendECL', {val: edit.getValue(),
                                                 ver: $('#ver').val(),
                                                 old: $('#old').is(":checked"),
                                                 s: $('#s').is(":checked")});
            }, 1000);
        });

        button.click(function() {
            if(!button.hasClass('manual')){
                button.addClass('manual');
                auto = false;

                button.html("<div id='btLeft'>Run</div><div id='btRight'></div>");

                $('#btLeft').click(function(){
                    if(canSend) {
                        socket.emit('sendECL', {val: edit.getValue(),
                                                ver: $('#ver').val(),
                                                old: $('#old').is(":checked"),
                                                s: $('#s').is(":checked")});
                        canSend = false;
                        setTimeout(function(){
                            canSend = true;
                        }, 1000);
                    } else {
                        printTerminal("<span class=\"warning\">Please wait! You\'re going too fast.</span>");
                    }
                });

                $('#btRight').click(function(event){
                    event.stopPropagation();
                    button.html("Automatic");
                    button.removeClass('manual');
                    auto = true;
                });
            }
        });
    });
});

function showTab(evt, tabName) {
  $(".tabcontent").hide();
  $(".tablinks").removeClass("active");

  $("#"+tabName).show();
  $(evt.target).addClass("active");
}

$(window).on("orientationchange", updateMedia);
$(window).on("focus", updateMedia);

$(window).on("unload", function(e) {
    if(newWindow!=undefined) newWindow.close();
});

