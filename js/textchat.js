function initTextChat(messager, messageArea, chatMessage, sendBtn) {

    var publisher = messager.publisher;
    messager.subscribe(publisher, function(data){
        _updateMessageBoard(data, messageArea);
    });
    messager.subscribeSys(function(data){
        _updateMessageBoard(data, messageArea);
    });

    $('#'+chatMessage).focus();

    $('#'+sendBtn).click(function(event){
        var msg = $('#'+chatMessage).val();
        var data = {};
        data.msg = msg;
        messager.sendMessage(
            {
                message: data,
                publisher: publisher
            }
        );
        $('#'+chatMessage).val('');
        $('#'+chatMessage).focus();
    });

    $('#'+chatMessage).keypress(function(event){
        var charCode = event.charcode || event.keyCode || event.which;
        if (charCode == 13) {
            var msg = $('#'+chatMessage).val();
            var data = {};
            data.msg = msg;
            messager.sendMessage(
                {
                    message: data,
                    publisher: publisher
                }
            );
            $('#'+chatMessage).val('');
            $('#'+chatMessage).focus();
        }
    });
}

function _updateMessageBoard(data, messageArea) {
    if (data.user == 'system') {
        var html = '<span style="color:red">System: '+data.message+'</span><br>';
        $('#'+messageArea).append(html);
    } else {
        $('#'+messageArea).append(data.user +': ' + data.message.msg + '<br>');
    }
    $('#'+messageArea).animate({scrollTop: $('#'+messageArea).prop("scrollHeight")}, 500);
}
