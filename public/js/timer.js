function startTimer(time, socket) {
  let id = setInterval(() => {
    //Update view every 1s
    time -= 1;
    updateTimer(time, id, socket);
  }, 1000);
}

function updateTimer(time, id, socket) {
   socket.emit('timer', time);
  if (time <= 0) {
    clearInterval(id);
  }
}

export { startTimer };