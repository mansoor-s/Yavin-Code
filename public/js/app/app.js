$(window).load(function() {

    try {
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/twilight");
        
        //var eventManager = require('pilot/event_emitter');
        
        var EditorMode = require("ace/mode/javascript").Mode;
        var editorSession = editor.getSession();
        
        editorSession.setMode(new EditorMode());
    
    
        var $editor = $('#editor');
        var $editorGuter = $editor.children('.ace_gutter');
        var $editorCode = $editor.find('.ace_text-layer');
        
        now.roomSlug = 'room_' + location.href.substring(location.href.lastIndexOf('/') + 1,location.href.length);
        
        var cookieName = 'room_' + location.href.substring(location.href.lastIndexOf('/') + 1,location.href.length) + '_sessID';
        
        now.sessID = (function(name) {
            var aCookie = document.cookie.split("; ");
                for (var i=0; i < aCookie.length; i++) {
                    var aCrumb = aCookie[i].split("=");
                    if (name == aCrumb[0]) {
                        return unescape(aCrumb[1]);
                    }
                }
            return null;
        })(cookieName);
        
        
        var changeControlFlag = true;

        now.ready(function(){
            
            editorSession.addEventListener('change', function() {
                if (changeControlFlag) {
                    now.update_code(editorSession.getValue(), function() {
                        changeControlFlag = true;
                    });
                    
                    
                }
            });
        });

        now.set_permission = function(perm) {
            
            now.permission = perm;
            if (now.permission < 2) {
                now.set_readOnly(false);
            } else {
                now.set_readOnly(true);
            }
        };
        
        
        now.update_code_client = function(data) {
            if(now.permission == 2 ) {
                changeControlFlag = false;
                editorSession.setValue(data);
                changeControlFlag = true;
            }
        };
        
        now.set_readOnly = function(bool) {
            editor.setReadOnly(bool);
        };

        now.consoleLog = function(data) {
            if (window.console != undefined) {
                console.log(data);
            }
        };
        /*
        now.client_getCookie = function(callback) {
            var room = 'room_' + location.href.substring(location.href.lastIndexOf('/') + 1,location.href.length) + '_sessID';
            callback(getCookie(room));
        };
        */
        now.user_connected = function(userName) {
           // console.log('user joined: ' + userName);
        };

        
        var controlsOpen = true;
        $('#options-trigger-app').click(function(event) {
            if (controlsOpen) {
                $('#controls-app').animate({
                    width: '0px'
                }, 50, function() {
                    $(this).hide();
                    controlsOpen = false;
                });
                
                
            } else {
                $('#controls-app').show();
                $('#controls-app').animate({
                    width: '200px'
                }, 50, function() {
                    controlsOpen = true;
                });
                
            }
        });
    } catch(err) {
        console.log('Ace threw an error!: ' + err);
    };
    
    $('#controls-accord').accordion();
    
});
