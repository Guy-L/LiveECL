var ecl = "";
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

function download(){
    //var a = document.getElementById("a");
    //a.style.display = "block";
    //var file = new Blob([text], {type: type});
    //a.href = URL.createObjectURL(file);
    //a.download = name;
}

function upload(){
    //todo
}

function themeSwitch(){
    //todo
}

function fullscreen(){ //todo
    unhandledF = true;
}

function switchFocus(){ //todo
    $("#gameWindow").focus();
}

function clear(){
    unhandledC = true;
}

function restart(){
    var game = $('#gameWindow');
    if(game.length){
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
    $(".CodeMirror").toggleClass("edit");

    $(document).keydown(function(e) {
        if(e.altKey) {
            switch(e.keyCode){
                case 67: //C
                    e.preventDefault();
                    clear();
                    break;

                case 70: //F
                    e.preventDefault();
                    fullscreen();
                    break;

                case 82: //R
                    e.preventDefault();
                    printTerminal("<span class=\"gameLog\">GAME:</span> <i>Reloading...</i>");
                    restart();
                    break;

                case 83: //S
                    e.preventDefault();
                    switchFocus();
                    break;

                case 83: //W
                    alert("incoming feature");
                    break;
            }
        }
    });

    $("#new").click(newFile);
    $("#download").click(download);
    $("#upload").click(upload);
    $("#theme").click(themeSwitch);

    $("#fullscreen").click(fullscreen);
    $("#windowOpen").click(windowOpen);
    $("#switch").click(switchFocus);
    $("#clear").click(clear);
    $("#restart").click(restart);

    $("#display").click(function(){
        if($("#display").html() == "More.."){
            $(".opt").css("display", "inline-block");
            $("#display").html("Less..");
        } else {
            $(".opt").css("display", "none");
            $("#display").html("More..");
        }
    });

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