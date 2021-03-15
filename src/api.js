const API_KEY = '52d560531aec252bccb710ababace71b484ba5e2a7ba9876ade25ac7df3f2d06'

const tickersHandlers = new Map()

// TODO: зарефакторить с использованием URLSearchParams
const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return
  }

  return fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()]}&tsyms=USD&api_key=${API_KEY}`)
    .then(r => r.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(Object.entries(rawData).map(([key, value]) => [key, value.USD]))
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? []
        handlers.forEach(fn => fn(newPrice))
      })
    })
}

export const subscribeToTicker = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, callback])
}

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker)
}

setInterval(loadTickers, 5000)

window.tickersHandlers = tickersHandlers
