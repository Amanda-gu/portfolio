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