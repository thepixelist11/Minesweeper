// ---------- Utils
function lerp(A, B, t) {
  return A + (B - A) * t;
}

function getIntersection(A, B, C, D) {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
  }

  return null;
}

function polysIntersection(poly1, poly2) {
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const touch = getIntersection(poly1[i], poly1[(i + 1) % poly1.length], poly2[j], poly2[(j + 1) % poly2.length]);
      if (touch) {
        return true;
      }
    }
  }
  return false;
}

function getRGBA(value) {
  const alpha = Math.abs(value);
  const R = value < 0 ? 0 : 255;
  const G = R;
  const B = value > 0 ? 0 : 255;
  return 'rgba(' + R + ',' + G + ',' + B + ',' + alpha + ')';
}

function swap(arr, firstIndex, secondIndex) {
  var temp = arr[firstIndex];
  arr[firstIndex] = arr[secondIndex];
  arr[secondIndex] = temp;
}
function sort(arraytest) {
  var len = arraytest.length,
    i,
    j,
    stop;
  for (i = 0; i < len; i++) {
    for (j = 0, stop = len - i; j < stop; j++) {
      if (arraytest[j] > arraytest[j + 1]) {
        swap(arraytest, j, j + 1);
      }
    }
  }
  return arraytest;
}

class col {
  constructor(r, g, b, a = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}
class aARect{
  constructor(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.update()
  }

  update(){
    this.points = [
      [this.x, this.y],
      [this.x + this.width, this.y],
      [this.x + this.width, this.y + this.height],
      [this.x, this.y + this.height],
    ]
  }
}

function drawPoint(x, y, radius, ctx, color = new col(0, 0, 0)) {
  ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b}, ${color.a})`
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawLine(x1, y1, x2, y2, width, ctx, color = new col(0, 0, 0)){
  ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b}, ${color.a})`
  ctx.lineWidth = width
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawPoly(points, ctx, borderWidth, color = new col(0, 0, 0), filled = false, fillCol = new col(0, 0, 0)){
  if(!filled){
    //Draw the edges of the polygon
    for(let i = 0; i < points.length - 1; i++){
      drawLine(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], borderWidth, ctx, color)
    }
    drawLine(points[points.length - 1][0], points[points.length - 1][1], points[0][0], points[0][1], borderWidth, ctx, color)
  } else {
    ctx.lineWidth = borderWidth
    ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b}, ${color.a})`
    ctx.fillStyle = `rgb(${fillCol.r}, ${fillCol.g}, ${fillCol.b}, ${fillCol.a})`
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    //Add verticies
    for(let i = 1; i < points.length; i++){
      ctx.lineTo(points[i][0], points[i][1])
    }
    ctx.lineTo(points[0][0], points[0][1])
    ctx.fill();
  }
}

function deg2rad(x){
  return x * Math.PI / 180
}

function rad2deg(x){
  return x * 180 / Math.PI
}

function index2coords(index, width){
  return {
    x: index % width,
    y: Math.floor(index / width - 1) + 1
  }
}

function coords2index(x, y, width){
  return x + (y * width)
}

function snapToGrid(x, y, width, height){
  const retX = Math.floor(x / width)
  const retY = Math.floor(y / height)

  return {
    x: retX,
    y: retY
  }
}
function drawGrid(backgroundCol, lineCol, ctx, countX, countY, fillBackground, lineWidth = 2){
  if(fillBackground){
    ctx.fillStyle = `rgb(${backgroundCol.r}, ${backgroundCol.g}, ${backgroundCol.b})`
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
  for(let i = 1; i < countX; i++){
    drawLine(i * ctx.canvas.width / countX, 0, i * ctx.canvas.width / countX, ctx.canvas.height, lineWidth, ctx, lineCol)
  }
  for(let i = 1; i < countY; i++){
    drawLine(0, i * ctx.canvas.height / countY, ctx.canvas.height, i * ctx.canvas.height / countY, lineWidth, ctx, lineCol)
  }
}

function expand(s){
  let sets = s.split(',')
  let ret = []
  for(let i = 0; i < sets.length; i++){
    const quant = parseInt(sets[i].split(':')[0])
    const val = sets[i].split(':')[1]
    for(let j = 0; j < quant; j++){
      ret.push(val)
    }
  }
  return ret
}

function compress(a){
  let lastVal = null
  let currentQuant = 0
  let currentVal = null
  let ret = ''
  for(let i = 0; i < a.length; i++){
    if(i == 0){
      currentVal = a[0]
      currentQuant = 0
      lastVal = a[0]
    }
    if(a[i] != lastVal){
      ret = ret.concat(`${currentQuant}:${currentVal},`)
      currentVal = a[i]
      lastVal = a[i]
      currentQuant = 1
    } else {
      currentQuant++
    }
  }
  ret = ret.concat(`${currentQuant}:${currentVal},`)
  return ret
}

function getNumberOfNeighbours(array, value, index, width) {
  // Convert the 1D index to 2D coordinates
  const { x, y } = index2coords(index, width);

  // Define the relative coordinates of the neighbors
  const relativeCoords = [
    { dx: -1, dy: -1 }, // Top-left
    { dx: 0, dy: -1 },  // Top
    { dx: 1, dy: -1 },  // Top-right
    { dx: -1, dy: 0 },  // Left
    { dx: 1, dy: 0 },   // Right
    { dx: -1, dy: 1 },  // Bottom-left
    { dx: 0, dy: 1 },   // Bottom
    { dx: 1, dy: 1 }    // Bottom-right
  ];

  // Count the neighbors with the specified value
  let count = 0;
  for (const coord of relativeCoords) {
    const newX = x + coord.dx;
    const newY = y + coord.dy;
    if (newX >= 0 && newX < width && newY >= 0 && newY < array.length / width) {
      const newIndex = coords2index(newX, newY, width);
      if (array[newIndex] === value) {
        count++;
      }
    }
  }

  return count;
}

function mouseInArea(x, y, width, height){
  return uiMouse.x > x && uiMouse.x < x + width && uiMouse.y > y && uiMouse.y < y + height
}

// -------- Event Listeners
document.onmousemove = evt => {
  const rect = mainCanvas.getBoundingClientRect()
  mouse.x = evt.clientX - rect.left
  mouse.y = evt.clientY - rect.top

  const uiRect = uiCanvas.getBoundingClientRect()
  uiMouse.x = evt.clientX - uiRect.left
  uiMouse.y = evt.clientY - uiRect.top
}
document.onkeydown = evt => {
  if(!keys.includes(evt.key)){
    keys.push(evt.key)
  }
}
document.onkeyup = evt => {
  if(keys.includes(evt.key)){
    keys.splice(keys.indexOf(evt.key), 1)
  }
}
document.onblur = evt => {
  keys = []
  mouseDown = []
}
document.onmousedown = evt => {
  if(!mouseDown.includes(evt.button)){
    mouseDown.push(evt.button)
  }
  if (evt.button == 0 && !gameEnded) {
    const snappedMouse = snapToGrid(mouse.x, mouse.y, mainCanvas.width / board.width, mainCanvas.height / board.height)
    if (snappedMouse.x >= 0 && snappedMouse.x < board.width && snappedMouse.y >= 0 && snappedMouse.y < board.height)
      if (board.flags[coords2index(snappedMouse.x, snappedMouse.y, board.width)] === 0) {
        if (board.cells.includes(2)) {
          if (board.cells[coords2index(snappedMouse.x, snappedMouse.y, board.width)] !== 1) {
            board.cells[coords2index(snappedMouse.x, snappedMouse.y, board.width)] = 2
          } else {
            gameEnded = true
            showMines = true
          }
        } else {
          [...document.getElementsByClassName('initInputs')].map(e => e.style.display = 'none')
          board.cells[coords2index(snappedMouse.x, snappedMouse.y, board.width)] = 2
          board.randomizeBoard()
          board.cells[coords2index(snappedMouse.x, snappedMouse.y, board.width)] = 0
          floodFill(snappedMouse.x, snappedMouse.y, Number.POSITIVE_INFINITY, true)
        }
      }
  }
  if(evt.button == 2 && !gameEnded){
    const snappedMouse = snapToGrid(mouse.x, mouse.y, mainCanvas.width / board.width, mainCanvas.height / board.height)
    if(isValid(snappedMouse.x, snappedMouse.y) && board.cells.includes(2) && board.cells[coords2index(snappedMouse.x, snappedMouse.y, board.width)] !== 2){
      if(totalFlags > 0 && board.flags[coords2index(snappedMouse.x, snappedMouse.y, board.width)] !== 1){
        totalFlags--
        board.flags[coords2index(snappedMouse.x, snappedMouse.y, board.width)] = 1
      } else if(board.flags[coords2index(snappedMouse.x, snappedMouse.y, board.width)] === 1){
        totalFlags++
        board.flags[coords2index(snappedMouse.x, snappedMouse.y, board.width)] = 0
      }
    }
  }
}
document.onmouseup = evt => {
  if(mouseDown.includes(evt.button)){
    mouseDown.splice(mouseDown.indexOf(evt.button))
  }
}
document.oncontextmenu = evt => {
  evt.preventDefault()
}

// -------- General Functions
function fillCells(){
  for(let i = 0; i < board.width; i++){
    for(let j = 0; j < board.height; j++){
      if(board.cells[coords2index(i, j, board.width)] == 2){
        drawPoly([
          [i * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
          [(i + 1) * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
          [(i + 1) * mainCanvas.width / board.width, (j + 1) * mainCanvas.height / board.width],
          [i * mainCanvas.width / board.width, (j + 1) * mainCanvas.height / board.width],
        ], mainCtx, 0, new col(0, 0, 0), true, new col(230, 230, 230))
        if(board.cells[coords2index(i, j - 1, board.width)] != 2){
          if(showMines && board.cells[coords2index(i, j - 1, board.width)] === 1){
            drawPoly([
              [i * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
              [(i + 1) * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
              [(i + 1) * mainCanvas.width / board.width, (j + 1 / 3) * mainCanvas.height / board.width],
              [i * mainCanvas.width / board.width, (j + 1 / 3) * mainCanvas.height / board.width],
            ], mainCtx, 0, new col(0, 0, 0), true, new col(90, 90, 120))
          } else {
            drawPoly([
              [i * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
              [(i + 1) * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
              [(i + 1) * mainCanvas.width / board.width, (j + 1 / 3) * mainCanvas.height / board.width],
              [i * mainCanvas.width / board.width, (j + 1 / 3) * mainCanvas.height / board.width],
            ], mainCtx, 0, new col(0, 0, 0), true, new col(150, 150, 180))
          }
        }
      } else if(board.cells[coords2index(i, j, board.width)] == 0){
        drawPoly([
          [i * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
          [(i + 1) * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
          [(i + 1) * mainCanvas.width / board.width, (j + 1) * mainCanvas.height / board.width],
          [i * mainCanvas.width / board.width, (j + 1) * mainCanvas.height / board.width],
        ], mainCtx, 0, new col(0, 0, 0), true, new col(180, 180, 210))
      } else if(board.cells[coords2index(i, j, board.width)] == 1){
        drawPoly([
          [i * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
          [(i + 1) * mainCanvas.width / board.width, j * mainCanvas.height / board.width],
          [(i + 1) * mainCanvas.width / board.width, (j + 1) * mainCanvas.height / board.width],
          [i * mainCanvas.width / board.width, (j + 1) * mainCanvas.height / board.width],
        ], mainCtx, 0, new col(0, 0, 0), true, showMines ? new col(100, 100, 130) : new col(180, 180, 210))
      }
    }
  }
}

function floodFill(startX, startY, maxCount, extraLayer = false){
  let x = startX
  let y = startY

  let totalFilled = 0

  if(board.cells[coords2index(x, y, board.width)] == 2){
    return
  }
  let queue = new Queue()
  queue.add({x, y})

  while(!queue.isEmpty() && totalFilled < maxCount){
    const coords = queue.pop()
    x = coords.x
    y = coords.y
    if(board.cells[coords2index(x, y, board.width)] == 0){
      board.cells[coords2index(x, y, board.width)] = 2
      totalFilled++
      if(isValid(x + 1, y) && board.cells[coords2index(x + 1, y, board.width)] == 0 && getNumberOfNeighbours(board.cells, 1, coords2index(x + 1, y, board.width), board.width) == 0){
        queue.add({x: x + 1, y: y})
      }
      if(isValid(x - 1, y) && board.cells[coords2index(x - 1, y, board.width)] == 0 && getNumberOfNeighbours(board.cells, 1, coords2index(x - 1, y, board.width), board.width) == 0){
        queue.add({x: x - 1, y: y})
      }
      if(isValid(x, y + 1) && board.cells[coords2index(x, y + 1, board.width)] == 0 && getNumberOfNeighbours(board.cells, 1, coords2index(x, y + 1, board.width), board.width) == 0){
        queue.add({x : x, y: y + 1})
      }
      if(isValid(x, y - 1) && board.cells[coords2index(x, y - 1, board.width)] == 0 && getNumberOfNeighbours(board.cells, 1, coords2index(x, y - 1, board.width), board.width) == 0){
        queue.add({x : x, y: y - 1})
      }
      if(isValid(x + 1, y + 1) && board.cells[coords2index(x + 1, y + 1, board.width)] == 0 && getNumberOfNeighbours(board.cells, 1, coords2index(x + 1, y + 1, board.width), board.width) == 0){
        queue.add({x: x + 1, y: y + 1})
      }
      if(isValid(x - 1, y - 1) && board.cells[coords2index(x - 1, y - 1, board.width)] == 0 && getNumberOfNeighbours(board.cells, 1, coords2index(x - 1, y - 1, board.width), board.width) == 0){
        queue.add({x: x - 1, y: y - 1})
      }
      if(isValid(x - 1, y + 1) && board.cells[coords2index(x - 1, y + 1, board.width)] == 0 && getNumberOfNeighbours(board.cells, 1, coords2index(x - 1, y + 1, board.width), board.width) == 0){
        queue.add({x : x - 1, y: y + 1})
      }
      if(isValid(x + 1, y - 1) && board.cells[coords2index(x + 1, y - 1, board.width)] == 0 && getNumberOfNeighbours(board.cells, 1, coords2index(x + 1, y - 1, board.width), board.width) == 0){
        queue.add({x : x + 1, y: y - 1})
      }
    }
  }

  if(extraLayer){
    let outerLayer = new Set()
    for(let i = 0; i < board.cells.length; i++){
      if(board.cells[i] !== 2){
        if(getNumberOfNeighbours(board.cells, 2, i, board.width) > 0){
          outerLayer.add(`${index2coords(i, board.width).x},${index2coords(i, board.width).y}`)
        }
      }
    }
    outerLayer.forEach(c => {
      const coord = {x: parseInt(c.split(',')[0]), y: parseInt(c.split(',')[1])}
      board.cells[coords2index(coord.x, coord.y, board.width)] = 2
    })
  }
}

function isValid(x, y){
  return x >= 0 && x < board.width && y >= 0 && y < board.height
}

function fillNumbers(){
  for(let i = 0; i < board.cells.length; i++){
    if(board.surroundingMines[i] > 0 && board.cells[i] === 2){
      mainCtx.fillStyle = numberCols[board.surroundingMines[i]]
      mainCtx.textAlign = 'center'
      mainCtx.textBaseline = 'middle'
      mainCtx.font = `bold ${1 / ((board.width + board.height) / 2) * 200}px Courier`
      mainCtx.fillText(board.surroundingMines[i], (index2coords(i, board.width).x * mainCanvas.width / board.width) + mainCanvas.width / board.width / 2, (index2coords(i, board.width).y * mainCanvas.height / board.height) + mainCanvas.width / board.width / 2)
    }
  }
}

function drawFlag(x, y){
  scale = {x : mainCanvas.width / board.width, y: mainCanvas.height / board.height}
  drawLine((x * scale.x) + scale.x / 2, (y * scale.y) + scale.y / 2, (x * scale.x) + scale.x / 2, (y * scale.y) - scale.y / 4, 2, mainCtx, new col(120, 60, 30))
  drawPoly([
    [(x * scale.x) + scale.x / 2, (y * scale.y) + scale.y / 4],
    [(x * scale.x) + scale.x / 2, (y * scale.y) - scale.y / 4],
    [(x * scale.x) + scale.x / 1.1, y * scale.y]
  ], mainCtx, 2, new col(160, 50, 30), true, new col(200, 50, 30))
  drawPoly([
    [(x * scale.x) + scale.x / 2, (y * scale.y) + scale.y / 4],
    [(x * scale.x) + scale.x / 2, (y * scale.y) - scale.y / 4],
    [(x * scale.x) + scale.x / 1.1, y * scale.y]
  ], mainCtx, 2, new col(160, 50, 30))
}

function drawFlags(){
  for(let i = 0; i < board.flags.length; i++){
    if(board.flags[i] === 1){
      drawFlag(index2coords(i, board.width).x, index2coords(i, board.width).y)
    }
  }
}

function getDifferentIndices(array1, array2) {
  if (array1.length !== array2.length) {
    throw new Error('Both arrays must be of the same size')
  }

  const differentIndices = []
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      differentIndices.push(i)
    }
  }

  return differentIndices
}

function drawFlagCount(){
  drawLine(20, 22, 20, 52, 4, uiCtx, new col(120, 60, 30))
  drawPoly([
    [20, 22],
    [20, 42],
    [40, 32],
  ], uiCtx, 0, new col(0, 0, 0), true, new col(200, 50, 30))
  uiCtx.font = 'bold 20px Courier'
  uiCtx.fillStyle = 'rgb(0, 0, 0)'
  uiCtx.textAlign = 'left'
  uiCtx.textBaseline = 'middle'
  uiCtx.fillText(`${totalFlags}/${board.mineCount}`, 60, 37)
  drawLine(140, 5, 140, 65, 2, uiCtx, new col(130, 130, 160))
}

function drawWin(){
  uiCtx.font = 'bold 24px Courier'
  uiCtx.fillCol = new col(0, 0, 0)
  uiCtx.fillText('You Win!', 160, 37)
  if(mouseInArea(300, 20, 85, 30)){
    uiCanvas.style.cursor = 'pointer'
    drawPoly([
      [300, 20],
      [385, 20],
      [385, 50],
      [300, 50],
    ], uiCtx, 2, new col(80, 80, 100), true, new col(140, 140, 150))
    drawPoly([
      [300, 20],
      [385, 20],
      [385, 50],
      [300, 50],
    ], uiCtx, 2, new col(110, 110, 130))
    uiCtx.font = '18px Courier'
    uiCtx.fillStyle = 'rgb(0, 0, 0)'
    uiCtx.fillText('Restart', 305, 36)
  } else {
    uiCanvas.style.cursor = 'default'
    drawPoly([
      [300, 20],
      [385, 20],
      [385, 50],
      [300, 50],
    ], uiCtx, 2, new col(80, 80, 100), true, new col(120, 120, 140))
    drawPoly([
      [300, 20],
      [385, 20],
      [385, 50],
      [300, 50],
    ], uiCtx, 2, new col(80, 80, 100))
    uiCtx.font = '18px Courier'
    uiCtx.fillStyle = 'rgb(0, 0, 0)'
    uiCtx.fillText('Restart', 305, 36)
  }
}

function drawLose(){
  uiCtx.font = 'bold 24px Courier'
  uiCtx.fillCol = new col(0, 0, 0)
  uiCtx.fillText('You Lost!', 160, 37)
  if(mouseInArea(300, 20, 85, 30)){
    uiCanvas.style.cursor = 'pointer'
    drawPoly([
      [300, 20],
      [385, 20],
      [385, 50],
      [300, 50],
    ], uiCtx, 2, new col(80, 80, 100), true, new col(140, 140, 150))
    drawPoly([
      [300, 20],
      [385, 20],
      [385, 50],
      [300, 50],
    ], uiCtx, 2, new col(110, 110, 130))
    uiCtx.font = '18px Courier'
    uiCtx.fillStyle = 'rgb(0, 0, 0)'
    uiCtx.fillText('Restart', 305, 36)
  } else {
    uiCanvas.style.cursor = 'default'
    drawPoly([
      [300, 20],
      [385, 20],
      [385, 50],
      [300, 50],
    ], uiCtx, 2, new col(80, 80, 100), true, new col(120, 120, 140))
    drawPoly([
      [300, 20],
      [385, 20],
      [385, 50],
      [300, 50],
    ], uiCtx, 2, new col(80, 80, 100))
    uiCtx.font = '18px Courier'
    uiCtx.fillStyle = 'rgb(0, 0, 0)'
    uiCtx.fillText('Restart', 305, 36)
  }
}

function clampInputs(){
  document.getElementById('sizeInput').value = Math.min(Math.max(document.getElementById('sizeInput').value, 6), 30)
  size = parseInt(document.getElementById('sizeInput').value)
  document.getElementById('mineInput').value = Math.min(Math.max(document.getElementById('mineInput').value, 10), Math.min(99, Math.pow(size, 2) - 9))
  mineCount = parseInt(document.getElementById('mineInput').value)
  board = new Board(size, size, mineCount)
}
// -------- Classes
class Board{
  constructor(width, height, mineCount){
    this.width = width
    this.height = height
    this.mineCount = mineCount
    
    this.cells = new Array(width * height).fill(0)
    this.surroundingMines = new Array(width * height).fill(0)
    this.flags = new Array(width * height).fill(0)

    totalFlags = mineCount
  }

  randomizeBoard(){
    for(let i = 0; i < Math.min(this.mineCount, (this.width * this.height) - getNumberOfNeighbours(board.cells, 0, board.cells.indexOf(2), board.width) + 1); i++){
      let cellIndex = Math.floor(Math.random() * this.cells.length)
      while(this.cells[cellIndex] != 0 || getNumberOfNeighbours(board.cells, 2, cellIndex, board.width) > 0){
        cellIndex = Math.floor(Math.random() * this.cells.length)
      }
      this.cells[cellIndex] = 1
    }
    for(let i = 0; i < this.cells.length; i++){
      this.surroundingMines[i] = getNumberOfNeighbours(this.cells, 1, i, this.width)
    }
  }
}

class Queue{
  #values;
  constructor(...items){
    this.#values = [...items]
  }
  add(value){
    this.#values[this.#values.length] = value
  }
  pop(){
    const ret = this.#values[0]
    this.#values.splice(0, 1)
    return ret
  }
  isEmpty(){
    return this.#values.length === 0
  }
}

// -------- Variables and Constants
const mainCanvas = document.getElementById('mainCanvas')
const mainCtx = mainCanvas.getContext('2d')

const uiCanvas = document.getElementById('uiCanvas')
const uiCtx = uiCanvas.getContext('2d')

const numberCols = {
  1: 'rgb(100, 100, 220)',
  2: 'rgb(100, 150, 100)',
  3: 'rgb(200, 110, 110)',
  4: 'rgb(160, 40, 230)',
  5: 'rgb(230, 40, 60)',
  6: 'rgb(235, 135, 30)',
  7: 'rgb(215, 210, 30)',
  8: 'rgb(0, 0, 90)',
}

let mouse = {x: 0, y: 0}
let uiMouse = {x: 0, y: 0}
let mouseDown = []
let keys = []

let showMines = false
let mineCount = 60
let size = 20

let totalFlags = mineCount
let board = new Board(size, size, mineCount)

let gameEnded = false
let won = false

// -------- Main
main()
ui()
function main(time){
  mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
  
  // Win
  if(getDifferentIndices(board.cells.map(e => e === 1), board.flags.map(e => e === 1)).length < 1 && board.cells.includes(2)){
    showMines = true
    gameEnded = true
    won = true
    for(let i = 0; i < board.cells.length; i++){
      if(board.cells[i] == 0){
        board.cells[i] = 2
      }
    }
  }
  
  fillCells()
  drawGrid(new col(0, 0, 0), new col(160, 160, 190, 0.4), mainCtx, board.width, board.height, false)
  drawFlags()
  if(!won){
    fillNumbers()
  }

  if(!gameEnded){
    requestAnimationFrame(main)
  }
}

function ui(time){
  uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height)

  drawFlagCount()
  if(gameEnded){
    if(won){
      drawWin()
      if(mouseInArea(300, 20, 85, 30) && mouseDown.includes(0)){
        location.reload()
      }
    } else {
      drawLose()
      if(mouseInArea(300, 20, 85, 30) && mouseDown.includes(0)){
        location.reload()
      }
    }
  }

  requestAnimationFrame(ui)
}
