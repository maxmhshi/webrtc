var webrtc = null;

function initVideoChat(createBtn, localVideoId, remoteVideoId, messager) {
    //subscribe for send message of ending video chat
    var publisher = 'videochat';
    messager.subscribe(publisher, function(data){
        if (data.message.cmd == 'end' && webrtc != null) {
            //leaveRoom has bug for chrome,
            //stop video manually.
            webrtc.stopLocalVideo();
            webrtc.leaveRoom();
            //webrtc = null;
            //webrtc.connection.disconnect();
            $('#'+localVideoId).attr('src', null);
            if ($('#'+remoteVideoId).children('video').length>0) {
                $('#'+remoteVideoId).children('video')[0].remove();
            }
            $('#'+createBtn).attr('roomid', '0');
            $('#'+createBtn).html('Start Video Call');
        }
    });


    $('#'+createBtn).click(function(event){
        var data = {};
        var roomid = $(this).attr('roomid');
        if (roomid != '0') {
            data.cmd = 'end';
            messager.sendMessage(
                {
                    message: data,
                    publisher: publisher
                }
            );
            return;
        }

        roomid = makeid(10);

        $(this).attr('roomid', roomid);
        $(this).html('End Video Call');
        if (webrtc == null) {
            webrtc = new SimpleWebRTC({
                localVideoEl: localVideoId,
                remoteVideosEl: '',
                autoRequestMedia: true
            });
        } else {
            webrtc.startLocalVideo();
        }

        webrtc.createRoom(roomid, function(err, name){
            console.log('Create room: ', arguments);
        });
   
        data = {}; 
        onVideoChange(remoteVideoId);
        data.msg = '<a href="javascript:joinVideoChat(\''+roomid+'\', \''+localVideoId+'\', \''+remoteVideoId+'\')">'
            + 'Join my video call</a>';
        messager.sendMessage(
            {
                message: data,
                publisher: messager.publisher
            }
        );
    });

}

function joinVideoChat(roomid, localVideoId, remoteVideoId) {
    $('#create').attr('roomid', roomid);
    $('#create').html('End Video Call');
    if (webrtc == null) {
        webrtc = new SimpleWebRTC({
            localVideoEl: localVideoId,
            remoteVideosEl: remoteVideoId,
            autoRequestMedia: true
        });
    }

    webrtc.startLocalVideo();

    webrtc.once('readyToCall', function() {
        webrtc.joinRoom(roomid);
    });
    onVideoChange(remoteVideoId);
}

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return text;
}

function onVideoChange(remoteVideoId) {
    webrtc.once('videoAdded', function(video, peer){
        console.log('Video added', video);
        $('#'+remoteVideoId).append(video);
        video.style.width = $('#'+remoteVideoId).width() + 'px';
        video.style.height = $('#'+remoteVideoId).height() + 'px';
    });

    webrtc.once('videoRemoved', function(video, peer){
        console.log(peer);
        $('#'+remoteVideoId).empty();
    });
}
