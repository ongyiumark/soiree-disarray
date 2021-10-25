/*function draw() {
    const canvas = document.querySelector("#canvas");

    if (!canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = 'red';
    ctx.linWidth = 5;

    ctx.beginPath();
    ctx.moveTo(100,100);
    ctx.lineTo(300,100);
    ctx.stroke();
}

draw(); */

// Global Variables
var graph = new Object();
var states = new Array();
var partitions = new Object();
var state2idx = new Object();

var started = false;
var start_state = "BBBGGG";
var goal_partition = "GB";

var current_state;

function start(){
    if (started) return;

    initialize();
    started = true;
    var par = document.createElement("p");
    par.innerHTML = "Welcome to Soirée Disarray!"
    document.body.appendChild(par);

    // Generate image tags.
    images = new Array();
    for (let i = 0; i < 6; i++){
        var s = start_state.charAt(i) == 'B' ? "male" : "female"
        images.push(generate_image(s, i));
    }

    for (let i = 0; i < 6; i++){
        document.body.appendChild(images[i]);
    }
    console.log(images)
}

// Takes in male/female and generates the appropriate image tag.
function generate_image(s, id){
    var res = document.createElement("IMG");
    res.setAttribute("src", "assets/"+s+".png");
    res.setAttribute("height", "150");
    res.setAttribute("alt", s);
    res.setAttribute("id", "img"+id.toString())
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
                [arr[a], arr[b]] = [arr[b], arr[a]];
                
                var nstate = arr.join('');
                var w = (b-a == 1 ? 2 : 3);

                graph[state].push({
                    to: nstate,
                    weight: w
                });

                [arr[a], arr[b]] = [arr[b], arr[a]];
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