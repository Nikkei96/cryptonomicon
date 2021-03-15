const API_KEY = '52d560531aec252bccb710ababace71b484ba5e2a7ba9876ade25ac7df3f2d06'

export const loadTicker = tickers => {
  return fetch(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(',')}&api_key=${API_KEY}`).then(r => r.json())
}
