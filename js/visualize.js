function drawHelper(nodes){
    var n = nodes.length;
    var len = Array();
    for (let i = 0; i < n; i++){
        var childNodes = nodes[i].querySelectorAll(":scope > .node");
        var childLen = drawHelper(childNodes);
        len.push(childLen);
    }

    if (n%2 == 0){
        var mid = Math.floor(n/2);
        var leftPos = -10;
        for (let i = mid-1; i >= 0; i--){
            nodes[i].style["left"] = leftPos.toString()+"px";
            leftPos -= 20;
        }

        var rightPos = -10;
        for (let i = mid; i < n; i++) {
            nodes[i].style["right"] = rightPos.toString()+"px";
            rightPos -= 20;
        }
    }
    else {
        var mid = Math.floor(n/2);
        var leftPos = -20;
        for (let i = mid-1; i >= 0; i--){
            nodes[i].style["left"] = leftPos.toString()+"px";
            leftPos -= 20;
        }

        var rightPos = -20;
        for (let i = mid+1; i < n; i++) {
            nodes[i].style["right"] = rightPos.toString()+"px";
            rightPos -= 20;
        }
    }

    return n;
}

function drawGraph(){
    var logVisDiv = document.getElementById("log-vis");
    var nodes = logVisDiv.querySelectorAll(":scope > .node");
    drawHelper(nodes);
}