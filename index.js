var ecl = "";
var dlCount = 1;
var edit;
var unhandledC = false;
var unhandledF = false;

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
        document.querySelector("#gameWindow").requestFullscreen();
        $("#gameWindow").focus();
    } else {
        printTerminal("<span class=\"warning\"><i>Sorry, your browser does not support fullscreen viewing.</i></span>");
    }
}

function windowOpen(){ //todo
    window.open("game.html", "test", "width=384, height=448, location=no, menubar=no, toolbar=no, titlebar=no");
}

function clearBullets(){
    unhandledC = true;
}

function restart(){
    var game = $('#gameWindow');
    if(game.length){
        printTerminal("<span class=\"gameLog\">GAME:</span> <i>Reloading...</i>");
        game.attr('src', function (i, val) {return val;});
    }
}

$(document).ready(function() {
    var socket = io.connect('https://live-ecl.herokuapp.com/');

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
    $(".CodeMirror").addClass("edit");

    $(document).keydown(function(e) {
        if(e.altKey) {
            switch(e.keyCode){ //todo all
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
                    $("#gameWindow").focus();
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
        } else {
            $(".opt").css("display", "none");
            $("#display").html("More..");
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