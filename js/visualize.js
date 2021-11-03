// Holds tree information
var bfsTree = new Object();
var bfsTreePath = new Array();
var heuristicTree = new Object();

// Add listeners to the tree
function addTreeListeners(){
    var toggler = document.getElementsByClassName("caret");
    var toggleidx;

    for (toggleidx = 0; toggleidx < toggler.length; toggleidx++) {
        toggler[toggleidx].addEventListener("click", function() {
            this.parentElement.querySelector(".nested").classList.toggle("active");
            this.classList.toggle("caret-down");
        });
    }
}

function heuristicTreeHelper(state, idx, data){
    var li = document.createElement("LI");
    
    // Insert node name
    var span = document.createElement("SPAN");
    span.innerHTML = state;
    if (data != null) {
        span.innerHTML = `${data.state} (cost: ${data.weight}, score: ${data.score})`
    }
    span.setAttribute("class", "caret solution");
    if (idx+1 == heuristicSol.length) {
        span.setAttribute("class", "solution");
    }
    li.appendChild(span);

    var ul = document.createElement("UL");
    ul.setAttribute("class", "nested");

    // Insert chidren
    var children = heuristicTree[state];
    for (let i = 0; i < children.length; i++){
        var child = children[i];
        if (child.state == heuristicSol[idx+1]){
            ul.appendChild(heuristicTreeHelper(child.state, idx+1, child));
        }
        else {
            var liChild = document.createElement("LI");
            liChild.innerHTML = `${child.state} (cost: ${child.weight}, score: ${child.score})`
            if (child.vis == true) {
                liChild.setAttribute("class", "ignored");
            }
            ul.appendChild(liChild);
        }
    }
    if (children.length > 0 ) li.appendChild(ul);

    return li;
}

function buildHeuristicTree(){
    var div = document.getElementById("tree");
    var hid = div.getAttribute("hidden");
    if (hid != null) div.removeAttribute("hidden");

    div.innerHTML = '';
    var n = heuristicSol.length;
    
    var treeHead = document.createElement("UL");
    treeHead.setAttribute("id", "tree-head");

    var childNodes = heuristicTreeHelper(heuristicSol[0], 0, null);
    treeHead.appendChild(childNodes);
    div.appendChild(treeHead);

    addTreeListeners();
}


function bfsTreeHelper(u, cost){
    var li = document.createElement("LI");
    
    // Insert node name
    var span = document.createElement("SPAN");
    span.innerHTML = u.state;
    if (cost > 0) span.innerHTML += ` (cost: ${cost})`
    spanClass = new Array();

    var children = bfsTree[u.state+u.idx.toString()];

    if (children != null && children.length > 0) spanClass.push("caret");
    if (bfsTreePath.includes(u.state+u.idx.toString())) spanClass.push("solution");

    span.setAttribute("class", spanClass.join(" "));
    li.appendChild(span);

    var ul = document.createElement("UL");
    ul.setAttribute("class", "nested");

    // Insert chidren
    if (children != null && children.length > 0){
        for (let i = 0; i < children.length; i++){
            var child = children[i];
            ul.appendChild(bfsTreeHelper(child, getCost(child.state, u.state)));
        }
        li.appendChild(ul);
    }

    return li;
}

function buildBfsTree(){
    var div = document.getElementById("tree");
    var hid = div.getAttribute("hidden");
    if (hid != null) div.removeAttribute("hidden");

    div.innerHTML = '';
    var treeHead = document.createElement("UL");
    treeHead.setAttribute("id", "tree-head");

    var start = bfsTreePath[0];

    var childNodes = bfsTreeHelper({state: start.substr(0, 6), idx: parseInt(start.substr(6))}, -1);
    treeHead.appendChild(childNodes);
    div.appendChild(treeHead);

    addTreeListeners();
}

function getCost(s1, s2){
    var arr = new Array();
    for (let i = 0; i < 6; i++){
        if (s1.charAt(i) != s2.charAt(i)){
            arr.push(i);
        }
    }
    var d = arr[1]-arr[0];
    return (d == 1 ? 2 : 3);
}