var sol = new Array();
var solTimes = new Array();
var solIdx = 0;
var solLog = "";

// Displays the div where the user can choose the starting state and goal partition.
function displayGameSelector(){
    var gameDiv = document.getElementById("game");
    var imgDiv = gameDiv.querySelector(".img-div");

    // Fill partition drop down menu.
    var sel = document.getElementById("partition-select")
    for (var key in partitions){
        var opt = document.createElement("OPTION");
        opt.setAttribute("value", key)
        opt.innerHTML = key;

        sel.appendChild(opt);
    }
    
    // Generate image tags.
    var images = new Array();
    for (let i = 0; i < 6; i++){
        var s = startState.charAt(i) == 'B' ? "male" : "female"
        images.push(generateImage(s, i, "img", true));
    }

    for (let i = 0; i < 6; i++){
        imgDiv.appendChild(images[i]);
    }


    var buttonDiv = gameDiv.querySelector(".button-div"); 
    var hbtn = document.createElement("BUTTON");
    hbtn.innerHTML = "Apply Heuristic";
    hbtn.setAttribute("onClick", "applyHeuristic()");
    buttonDiv.appendChild(hbtn);

    var hbtn = document.createElement("BUTTON");
    hbtn.innerHTML = "Apply BFS";
    hbtn.setAttribute("onClick", "applyBfs()");
    buttonDiv.appendChild(hbtn);
}

// Shows the 'heuristic' div and hides the 'bfs' div, and vice versa.
function showDiv(s){
    var hDiv = document.getElementById("heuristic");
    var bfsDiv = document.getElementById("bfs");
    if (s == "heuristic") {
        hDiv.removeAttribute("hidden");
        bfsDiv.setAttribute("hidden", "");
    }
    else {
        bfsDiv.removeAttribute("hidden");
        hDiv.setAttribute("hidden", "");
    }
}

// Add line to heuristicLog.
function addHeuristicLog(s) {
    heuristicLog += s+"<br>";
}

// Add line to bfsLog.
function addBfsLog(s) {
    bfsLog += s+"<br>";
}

// Displays solution on the page.
function displaySolution(solType){
    var div = document.getElementById(solType);
    var imgDiv = div.querySelector(".img-div");
    var buttonDiv = div.querySelector(".button-div")
    var found = false;
    solIdx = 0;
    if (solType == "heuristic") {
        sol = heuristicSol;
        solLog = heuristicLog;
        solTimes = heuristicTimes;
    }
    else {
        sol = bfsSol;
        solLog = bfsLog;
        solTimes = bfsTimes;
    }

    // Unhide log div
    var logDiv = document.getElementById("log");
    if (logDiv.getAttribute("hidden") != null) logDiv.removeAttribute("hidden");

    // Display solution
    var images = new Array();
    for (let i = 0; i < 6; i++){
        var s = sol[0].charAt(i) == 'B' ? "male" : "female"
        
        var oldimg = document.getElementById("img-"+solType+i.toString());
        if (oldimg) {
            oldimg.setAttribute("src", "assets/"+s+".png");
            found = true;
        }
        if (!found){
            images.push(generateImage(s, i, "img-"+solType, false));
            imgDiv.appendChild(images[i]);
        } 
    }

    // Display Log to Screen.
    var logDisp = document.getElementById("log-display");
    var pLog = logDisp.querySelector("p");
    pLog.innerHTML = solLog;


    if (!found){
        var nextbtn = document.createElement("BUTTON");
        var prevbtn = document.createElement("BUTTON");
        nextbtn.setAttribute("onclick", "solutionNext('"+solType+"')");
        prevbtn.setAttribute("onclick", "solutionPrev('"+solType+"')");
        nextbtn.innerHTML = "Next";
        prevbtn.innerHTML = "Prev";
        buttonDiv.appendChild(prevbtn); 
        buttonDiv.appendChild(nextbtn);

        var currtime = document.createElement("P");
        currtime.innerHTML = "Time: 0";
        currtime.setAttribute("id", solType+"-sol-time");
        currtime.style["font-family"] = "silkscreenBold";
        currtime.style["font-size"] = "large";

        div.appendChild(currtime);
    }
    updateDisplay(solType);
}

function updateDisplay(solType){
    var state = sol[solIdx];
    for (let i = 0; i < 6; i++){
        var s = state.charAt(i) == 'B' ? "male" : "female";
        var img = document.getElementById("img-"+solType+i.toString());
        img.setAttribute("src", "assets/"+s+".png");
    }

    var currtime = document.getElementById(solType+"-sol-time");
    currtime.innerHTML = "Time: "+solTimes[solIdx].toString();
}

function solutionNext(solType){
    if (solIdx == sol.length-1) return;
    solIdx += 1;
    updateDisplay(solType);
}

function solutionPrev(solType){
    if (solIdx == 0) return;
    solIdx -= 1;
    updateDisplay(solType);
}

// Takes in male/female and generates the appropriate image tag.
function generateImage(s, id, prefix, drag){
    var res = document.createElement("IMG");
    var attr = {
        "src": "assets/"+s+".png",
        "height": "150px",
        "alt": s,
        "class": "boygirl",
        "id": prefix+id.toString()
    }
    for (key in attr){
        res.setAttribute(key, attr[key]);
    }

    // Draggable attributes.
    if (drag){
        var dragAttr = {
            "ondrop": "drop(event)",
            "ondragover": "allowDrop(event)",
            "draggable": "true",
            "ondragstart": "drag(event)"
        }
        for (key in dragAttr){
            res.setAttribute(key, dragAttr[key]);
        }
    }
    return res;
}

// Allow drag and drop
function allowDrop(ev){
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev){
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

    // Swap images
    var img1 = document.getElementById(data);
    var img2 = ev.target;
    var src1 = img1.getAttribute("src");
    var src2 = img2.getAttribute("src");
    img1.setAttribute("src", src2);
    img2.setAttribute("src", src1);

    // Update start state.
    var idx1 = parseInt(img1.getAttribute("id")[3]);
    var idx2 = parseInt(img2.getAttribute("id")[3]);
    var tmp = startState.split('');
    tmp.swap(idx1,idx2);
    startState = tmp.join('');
}