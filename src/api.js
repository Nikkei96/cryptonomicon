// broadcast channel - канал, по которому можно слушать информацию с других вкладок

const API_KEY = 'ac0e071ce3f16ac5205c5076c21cd9137709e66a952c24c700d66707b5b46339'
// ac0e071ce3f16ac5205c5076c21cd9137709e66a952c24c700d66707b5b46339
const tickersHandlers = new Map()

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)

const AGGREGATE_INDEX = '5'

socket.addEventListener('message', e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data)
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return
  }

  const handlers = tickersHandlers.get(currency) ?? []
  handlers.forEach(fn => fn(newPrice))
})

// TODO: зарефакторить с использованием URLSearchParams
// const loadTickers = () => {
//   if (tickersHandlers.size === 0) {
//     return
//   }

//   return fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()]}&tsyms=USD&api_key=${API_KEY}`)
//     .then(r => r.json())
//     .then(rawData => {
//       const updatedPrices = Object.fromEntries(Object.entries(rawData).map(([key, value]) => [key, value.USD]))
//       Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//         const handlers = tickersHandlers.get(currency) ?? []
//         handlers.forEach(fn => fn(newPrice))
//       })
//     })
// }

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message)
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage)
    },
    { once: true }
  )
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`],
  })
}

function unSubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`],
  })
}

export const subscribeToTicker = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, callback])
  subscribeToTickerOnWs(ticker)
}

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker)
  unSubscribeFromTickerOnWs(ticker)
}

// setInterval(loadTickers, 5000)

window.tickersHandlers = tickersHandlers
