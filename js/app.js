function draw() {
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

draw();