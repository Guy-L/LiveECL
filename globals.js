///////// GENERAL USE METHODS
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

///////// CUSTOM FUNCTIONALITIES
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
    if(newWindow == null || newWindow.closed) {
        newWindow = window.open("game.html", "test", "width=384, height=448, location=no, menubar=no, toolbar=no, titlebar=no");
        $("#game").hide();
        $("#windowClose").show();
        $(".CodeMirror").width("100vw");
        $(".CodeMirror").css("resize","none");
    }
}

function windowClose(){
  if(newWindow != null){
      newWindow.close();
      gameRestore();
  }
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

function switchFocus(){
    if(newWindow == undefined){
        $("#gameWindow").focus();
    } else {
        newWindow.focus();
    }
}


/////////MAIN MENU FUNCTIONS
function showInfo(event){
    var menu = $("#infoMenu");
    if(menu.length){
        event.stopPropagation();
        menu.show();
        $("default").scroll();
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

function showTab(evt, tabName) {
  $(".tabcontent").hide();
  $(".tablinks").removeClass("active");

  $("#"+tabName).show();
  $("#"+tabName).scroll();
  $(evt.target).addClass("active");
}

function tabScroll(evt){
  tab = evt.target;
  if (tab.offsetHeight < tab.scrollHeight) {
      $("#pseudo-style").html(".tabcontent:before{height:"+Math.min(tab.scrollTop, 50)+"px;"
                                                +"top:calc(30px + "+(2+100*($("#tab").innerHeight() / $("#infoMenu").innerHeight()))+"%);}"
                             +".tabcontent:after{height:"+Math.min((tab.scrollHeight - tab.offsetHeight)-tab.scrollTop, 50)+"px;}");
  } else {
     $("#pseudo-style").html("");
  }
}

function debugPercent(evt){
   tab = evt.target;
   if (missing > 0) printTerminal("scroll: " + tab.scrollTop/(tab.scrollHeight - tab.offsetHeight)*100);
}