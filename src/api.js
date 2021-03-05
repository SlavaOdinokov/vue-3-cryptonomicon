const API_KEY =
  "5461481e3aa6992b0103556872e20953879476edf2cd2cf9727677ac56eb564";
const BASE_URL = "https://min-api.cryptocompare.com/data/";

const tickersHandlers = new Map();

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  fetch(
    `${BASE_URL}pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((response) => response.json())
    .then(rawData => { 
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      )

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach(fn => fn(newPrice));
      });
    });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (ticker) => {
  // const subscribers = tickersHandlers.get(ticker) || [];
  // tickersHandlers.set(ticker, subscribers.filter(fn => fn !== cb));
  tickersHandlers.delete(ticker);
};

export const loadAllTickers = () =>
  fetch(
    `${BASE_URL}all/coinlist?summary=true&api_key=${API_KEY}`
  ).then((response) => response.json());

setInterval(loadTickers, 5000)  
window.tickersHandlers = tickersHandlers;
