// Global Variables
var graph = new Object();
var states = new Array();
var partitions = new Object();
var state2idx = new Object();
var vis = new Array();

var started = false;
var start_state = "BBBGGG";
var goal_partition = "GB";

// Heuristic Variables
var current_state = "";
var time = 0;
var heuristic_solution = new Array();
var heuristic_log = "";

// Helper function to swap two elements of an array.
Array.prototype.swap = function(a,b){
    var tmp = this[a];
    this[a] = this[b];
    this[b] = tmp;
}

function start(){
    if (started) return;

    initialize();

    var game_div = document.getElementById("game");

    started = true;
    var welcome = document.createElement("P");
    welcome.innerHTML = "Welcome to Soirée Disarray!"
    game_div.appendChild(welcome);

    // Generate image tags.
    images = new Array();
    for (let i = 0; i < 6; i++){
        var s = start_state.charAt(i) == 'B' ? "male" : "female"
        images.push(generate_image(s, i, true));
    }

    for (let i = 0; i < 6; i++){
        game_div.appendChild(images[i]);
    }

    game_div.appendChild(document.createElement("BR"));

    var next_btn = document.createElement("BUTTON");
    next_btn.innerHTML = "Apply Heuristic";
    next_btn.setAttribute("onClick", "apply_heuristic()");
    game_div.appendChild(next_btn);
}

function apply_heuristic(){
    current_state = start_state;
    for (let i = 0; i < states.length; i++) vis[i] = false;
    time = 0;
    heuristic_log = "";
    heuristic_solution = new Array();
    
    while(true){
        heuristic_solution.push(current_state);

        heuristic_log += `Checking if '${current_state}' satisfies the '${goal_partition}' parition...<br>`;
        if (partitions[goal_partition].includes(current_state)) {
            heuristic_log += `'${current_state}' satisfies the '${goal_partition}' parition!<br>`;
            heuristic_log += `Game Over.<br><br>`;
            break;
        }
    
        heuristic_log += `Marking '${current_state}' as visited.<br>`;
        vis[state2idx[current_state]] = true;
    
        // Finding the best child node to expand to.
        var children = Array();
        var n = graph[current_state].length;
    
        for (let i = 0; i < n; i++){
            var state = graph[current_state][i].to;
            var score = heuristic_score(state, goal_partition);
            var weight = graph[current_state][i].weight;
            
            heuristic_log += `Considering going to '${state}'...<br>`
            if (vis[state2idx[state]]) {
                heuristic_log += `'${state}' has already been visited. Ignoring...<br>`
                continue;
            }

            children.push({
                score: score,
                weight: weight,
                state: state
            });
            heuristic_log += `'${state}' has a heuristic score of ${score} with cost ${weight}.<br>`;
        }
    
        children.sort((left, right) => {
            if (left.score == right.score && left.weight == right.weight){
                if (left.state < right.state) return -1;
                else if (left.state > right.state) return 1;
                else return 0;
            }
            else if (left.score == right.score) {
                return left.weight - right.weight;
            }
            return left.score-right.score;
        });
    
        var prev_state = current_state;
        var v = children[0];
        current_state = v.state;   
        time += v.weight;
        heuristic_log += `Expanding to state '${v.state}' with score ${v.score} and cost ${v.weight}...<br><br>`;
    }    

    heuristic_log += `The solution is ${heuristic_solution.join(", ")}.<br>`;
    heuristic_log += `This took ${time} units of time.<br>`;
    display_heuristic();
}

function display_heuristic(){
    // Display Log to Screen.
    var div = document.getElementById("heuristic");
    var iframe = document.getElementById("heuristic_frame");
    if (!iframe){
        iframe = document.createElement("IFRAME");
        iframe.setAttribute("width", "500");
        iframe.setAttribute("height", "200");
        iframe.setAttribute("marginwidth", "50");
        iframe.setAttribute("scrolling", "yes");
        iframe.setAttribute("id", "heuristic_frame");
        div.appendChild(iframe);
    }
    
    iframe.setAttribute("srcdoc", `<p>${heuristic_log}</p>`)

    // Dis
}

// Takes in male/female and generates the appropriate image tag.
function generate_image(s, id, drag){
    var res = document.createElement("IMG");
    res.setAttribute("src", "assets/"+s+".png");
    res.setAttribute("height", "150");
    res.setAttribute("alt", s);
    res.setAttribute("id", "img"+id.toString());

    // Draggable attributes.
    if (drag){
        res.setAttribute("ondrop", "drop(event)");
        res.setAttribute("ondragover","allow_drop(event)")
        res.setAttribute("draggable", "true");
        res.setAttribute("ondragstart","drag(event)");
    }
    return res;
}

// Generates the states, the partitions, and the graph.
function initialize(){
    // Get all permutations of "BBBGGG".
    states = get_permutations("BBBGGG");
    var n = states.length;

    // Turn raw states into their corresponding 6-bit number
    for (let i = 0; i < n; i++){
        state2idx[states[i]] = i;
        vis.push(false);
    }
    
    // Fill in partitions.
    for (let i = 0; i < n; i++){
        var p = get_partition(states[i]);
        if (!(p in partitions)) partitions[p] = new Array();
        partitions[p].push(states[i]);
    } 

    // Fill in graph.
    for (let i = 0; i < n; i++){
        var state = states[i];
        graph[state] = new Array();
        var arr = state.split("");
        for (let a = 0; a < 6; a++){
            for (let b = a+1; b < 6; b++){
                if (b-a > 2) break;
                if (arr[a] == arr[b]) continue;
                arr.swap(a,b);
                
                var nstate = arr.join('');
                var w = (b-a == 1 ? 2 : 3);

                graph[state].push({
                    to: nstate,
                    weight: w
                });

                arr.swap(a,b);
            }
        }
    }
}    

// Takes a string and generates all unique permutations.
function get_permutations(s){
    var res = Array();
    var n = s.length;
    if (n == 1) {
        res.push(s);
        return res;
    }

    for (let i = 0; i < n; i++){
        var curr = s.charAt(i);
        if (s.indexOf(curr) != i) continue;

        var rem = s.substr(0,i)+s.substr(i+1);
        var perms = get_permutations(rem);
        perms.sort();
        for (let j = 0; j < perms.length; j++){
            res.push(curr+perms[j]);
        }
    }
    return res;
}

// Takes a state and returns the partition it belongs to.
function get_partition(s){
    var res = s.charAt(0);
    for (let i = 1; i < 6; i++){
        if (s.charAt(i) != s.charAt(i-1)){
            res += s.charAt(i);
        }
    }
    return res;
}

// Takes 2 states and returns the number of wrong positions.
function wrong(s1, s2){
    var cnt = 0;
    for (let i = 0; i < 6; i++){
        if (s1.charAt(i) != s2.charAt(i)){
            cnt += 1;
        }
    }
    return cnt;
}

// Returns the heuristic score of a state with respect to the goal.
function heuristic_score(state, goal){
    var res = 1000;
    for (let i = 0; i < partitions[goal].length; i++){
        res = Math.min(res, wrong(state, partitions[goal][i]));
    }
    return res;
}

// Allow drag and drop
function allow_drop(ev){
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
    var tmp = start_state.split('');
    tmp.swap(idx1,idx2);
    start_state = tmp.join('');
}

