import io from 'socket.io-client';
import { World } from 'matter-js';
import engine from './src/engine';
import generateChip from './src/bodies/Chip';
import { Peg } from './src/bodies/Peg'

var socket = io.connect('http://radioactive-kittens.localtunnel.me/');

socket.on('connection established', (data) => {
  console.log('ESTABLISHED!')
})

var currentBodies = {}

socket.on('snapshot', (bodies) => {
  console.log('snapshot received')

  bodies.forEach(body => {
    if (!currentBodies[body.id]) {
      if (body.label === 'peg') {
        const peg = new Peg(body.x, body.y).body
        currentBodies[body.id] = peg
        World.add(engine.world, peg)
      } else if (body.label === 'chip') {
        const chip = generateChip(body.x, body.y).body
        chip.isStatic = true;
        currentBodies[body.id] = chip
        World.add(engine.world, chip)
      }
    } else {
      currentBodies[body.id].position.x = body.x;
      currentBodies[body.id].position.y = body.y;
    }
  })
})

document.addEventListener('DOMContentLoaded', function(e) {
  var canvas = document.querySelector('canvas')

  canvas.addEventListener('click', function(e) {
    e.stopPropagation()
    console.log('click event')
    const yCoordinate = Math.min(e.clientY, 200)

    socket.emit('new chip', { x: e.clientX, y: yCoordinate })
  })
})

// socket.on('pongResponse', function(msg) {
//   console.log(msg)
// })
//
// setInterval(function() {
//   socket.emit('pingRequest', {})
// }, 1000)
