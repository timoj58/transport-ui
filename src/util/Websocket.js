let socket;

export const init = () => {
  socket = new WebSocket('ws://localhost:8080/kotlin-lab');

  return socket;
};

export const get = () => {
  return socket;
};