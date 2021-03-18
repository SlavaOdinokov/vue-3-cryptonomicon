const API_KEY =
  "01d488df87f8030107acb3c9b5a1a4a65f6bf6aeac1ca0292d5600e4ffa3a7f3";
const BASE_URL = "https://min-api.cryptocompare.com/data/";
const AGGREGATE_INDEX = '5';

const tickersHandlers = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

socket.addEventListener('message', e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
});

const sendToWebSocket = (message) => {
  if (socket.readyState === WebSocket.OPEN) { 
    socket.send(message); 
    return; 
  }

  socket.addEventListener('open', () => {
    socket.send(message);
  }, { once: true });
};

const subscribeToTickerOnWs = (ticker) => {
  sendToWebSocket(JSON.stringify({
    "action": "SubAdd",
    "subs": [`5~CCCAGG~${ticker}~USD`]
  }))
};

const unsubscribeFromTickerOnWs = (ticker) => {
  sendToWebSocket(JSON.stringify({
    "action": "SubRemove",
    "subs": [`5~CCCAGG~${ticker}~USD`]
  }))
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  // const subscribers = tickersHandlers.get(ticker) || [];
  // tickersHandlers.set(ticker, subscribers.filter(fn => fn !== cb));
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

export const loadAllTickers = () =>
  fetch(
    `${BASE_URL}all/coinlist?summary=true&api_key=${API_KEY}`
  )
    .then((response) => response.json())
    .then((rawData) => Object.entries(rawData.Data).map(i => i[0]) );
  

// const loadTickers = () => {
//   if (tickersHandlers.size === 0) {
//     return;
//   }

//   fetch(
//     `${BASE_URL}pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`
//   )
//     .then((response) => response.json())
//     .then(rawData => { 
//       const updatedPrices = Object.fromEntries(
//         Object.entries(rawData).map(([key, value]) => [key, value.USD])
//       )

//       Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//         const handlers = tickersHandlers.get(currency) ?? [];
//         handlers.forEach(fn => fn(newPrice));
//       });
//     });
// }

// setInterval(loadTickers, 5000)
