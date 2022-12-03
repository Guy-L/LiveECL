var ecl = "";
var dlCount = 1;
var edit;
var unhandledC = false;
var unhandledF = false;
var isRefreshing = false;
var newWindow;

$(document).ready(function() {
    var socket = io.connect('https://live-ecl.herokuapp.com/');

    $(".default").click();
    updateMedia();

    if (localStorage.getItem("script") != null) {
     $("#edit").val(localStorage.getItem("script"));
    }
	
	//Calculates the percent of interpreted instructions for a category.
	//Used in the Progress section of the menu.
	$('.toCalcRetract').each(function(i, obj) {
		var txt = $(this).text(); //Following 2 variables assignments are for readability.
		var range = parseInt(txt.substring(txt.indexOf("-")+1, txt.indexOf(" "))) - parseInt(txt.substring(0, txt.indexOf("-"))) + 1;
		var count = $($(this).siblings(".retract")).find("table:not(#transformTable) li").length;
		var percent = (count/range * 100).toFixed(2);
		
		if(percent > 75){ $(this).append(" <span class=\"gameLog\">[" + percent + "%]</span>"); }
		else if(percent > 50){ $(this).append(" <span class=\"no-error\">[" + percent + "%]</span>"); }
		else if(percent > 25){ $(this).append(" <span class=\"warning\">[" + percent + "%]</span>"); }
		else{ $(this).append(" <span class=\"error\">[" + percent + "%]</span>"); }
	});

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
            switch(e.keyCode){
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

                case 71: //F
                    e.preventDefault();
                    godmode();
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
                    switchFocus();
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
        if($(this).attr("data-value") && $(this).attr("data-value") != 4){
            $(".selected").removeClass("selected");
            $(this).addClass("selected");
        }
    });

    socket.on('connect', function(){
        var button = $('.autoButton');
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
                                                  .replace(/thecl(:\(stdin\))*/g,"<span class=\"compLog\">Compiler</span>")
                                                  .replace(/[0-9]+\,[0-9]+/g, function(e){
                                                        var nums = e.split(",");
                                                        return "<a data-tip=\"Click&nbsp;to&nbsp;go&nbsp;there!\"" +
                                                                  "onclick=\"gotoLine("+(nums[0]-2) + "," + nums[1] + ");\">" +
                                                                                        (nums[0]-1) + "," + nums[1] + "</a>";
                                                  }));
        });

        socket.on('disconnect', function(){
            printTerminal("<span class=\"no-error\">Server:</span> <span class=\"warning\">Disconnected.</span>");
        });


        edit.on("change", function () {
			localStorage.setItem("script", edit.getValue());

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

                button.html("<div class='btLeft'>Run</div><div class='btRight'></div>");

                $('.btLeft').click(function(){
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

                $('.btRight').click(function(event){
                    event.stopPropagation();
                    button.html("Automatic");
                    button.removeClass('manual');
                    auto = true;
                });
            }
        });
    });
});

function updateMedia(){
    if(window.orientation == 0 && /Mobi|Android/i.test(navigator.userAgent)){
        $('#mobile').attr('media', 'all');
    } else {
        $('#mobile').attr('media', '(max-width: 760px)');
    }
}

$(window).on("orientationchange", updateMedia);
$(window).on("focus", updateMedia);

$(window).on("unload", function(e) {
    if(newWindow!=undefined) newWindow.close();
});

