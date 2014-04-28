function initPaint(paintArea, messager) {
    var publisher = 'room11';

    var areaSize = {};
    areaSize.height = $('#'+paintArea).height();
    areaSize.width = $('#'+paintArea).width();

    var stage = new Kinetic.Stage({
        container: paintArea,
        width: areaSize.width,
        height: areaSize.height
    });

    var layer1 = new Kinetic.Layer();
    var layer2 = new Kinetic.Layer();
    // add the layer to the stage
    stage.add(layer1);
    stage.add(layer2);
   
    var element = {}; 
    messager.subscribe('room11', function(data){
        if (data.user != messager.user) {
            if (data.message.cmd == 'new') {
                element = new Kinetic[data.message.type](
                    $.parseJSON(data.message.data)
                );
                layer2.add(element);
            } else if (data.message.cmd == 'update') {
                if (data.message.type == 'Line') {
                    element.attrs.points.push(data.message.data.x);
                    element.attrs.points.push(data.message.data.y);
                    element.draw();
                }
            } else {
                element = {};
            }
        }
    });

    var line = {},
        msg = {},
        pos = {};
    stage.on('contentMousedown', function(){
        var mousePos = this.getPointerPosition();
        pos.x = mousePos.x;
        pos.y = mousePos.y;
        line = new Kinetic.Line({
            x: 0,
            y: 0,
            points: [mousePos.x, mousePos.y],
            stroke: 'blue',
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round'
        });
        layer1.add(line);

        msg.cmd = 'new';
        msg.type = 'Line';
        msg.data = line.toJSON();
        messager.sendMessage({
            message: msg,
            publisher: publisher
        });
    });

    stage.on('contentMouseup', function(){
        line = {};
        pos = {};

        msg.cmd = 'destory';
        msg.type = 'Line';
        messager.sendMessage({
            message: msg,
            publisher: publisher
        });
    });

    function updateCanvas() {
        if (line.className != undefined) {
            var mousePos = stage.getPointerPosition();
            if (pos.x == mousePos.x && pos.y == mousePos.y) {
                setTimeout(updateCanvas, 84);
                return;
            }
            pos.x = mousePos.x;
            pos.y = mousePos.y;
            line.attrs.points.push(mousePos.x);
            line.attrs.points.push(mousePos.y);
            line.draw();

            msg.cmd = 'update';
            msg.type = 'Line';
            msg.data = {
                x: mousePos.x,
                y: mousePos.y
            };
            messager.sendMessage({
                message: msg,
                publisher: publisher
            });
        }
          
        setTimeout(updateCanvas, 84);
    };

    updateCanvas();

}


