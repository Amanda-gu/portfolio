//code taken from links, but instead of creating new shape, i defined the shapes in html and styled them in css, and then just move them with js
window.addEventListener('pointermove', (e) => {
 
  	let hLine = document.getElementById('h-line')
    let vLine = document.getElementById('v-line')
    let sq = document.getElementById('sq')
    let img = document.querySelectorAll('img')

    hLine.style.left = `${e.clientX}px`
    hLine.style.top = `${e.clientY}px`

    vLine.style.left = `${e.clientX}px`
    vLine.style.top = `${e.clientY}px`

    sq.style.left = `${e.clientX}px`
    sq.style.top = `${e.clientY}px`

    img.forEach((image) => {
        image.style.left = `${e.clientX}px`
        image.style.top = `${e.clientY}px`
    })
});
// let canvas = document.getElementById('pointer-box');
//   	// let hLine = document.getElementById('h-line')
//     // let vLine = document.getElementById('v-line')
//     // let sq = document.getElementById('sq')


// window.addEventListener('pointermove', (e) => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// //previous solution works well on desktop but on mobile, the pointer move event colides with the scroll
// //using canvas to draw the shapes instead of html elements, so it works better for mobile.
//     let ctx = canvas.getContext("2d");
//     ctx.fillStyle = "black";
//     ctx.lineWidth = 0.5;
//     // Add a rectangle at (10, 10) with size 100x100 pixels
//     ctx.fillRect(`${e.pageX}`, `${e.pageY}`, 10, 10);

//     ctx.moveTo(`${e.pageX}`, `${e.pageY}`);
//     // ctx.lineTo(0, 0);
//     ctx.lineTo(0, `${e.pageY}`);
//     ctx.lineTo(`${e.pageX}`, 0);
//     // ctx.lineTo(`${e.pageX}`, `${e.pageY}`);
//     // ctx.lineTo(0,  `${e.pageY*2}`);
//     // ctx.lineTo(`${e.pageX*2}`, 0);
//     // ctx.moveTo(`${e.pageX* 2}`, `${e.pageY}`);
//     // ctx.lineTo(`${e.pageX}`, `${e.pageY * 2}`);
//     ctx.stroke();
//     // hLine.style.left = `${e.pageX}px`
//     // hLine.style.top = `${e.pageY}px`

//     // vLine.style.left = `${e.pageX}px`
//     // vLine.style.top = `${e.pageY}px`

//     // sq.style.left = `${e.pageX}px`
//     // sq.style.top = `${e.pageY}px`
// });