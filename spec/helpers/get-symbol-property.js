export default function getSymbolProperty(object, privateField) {
  return Object.getOwnPropertySymbols(object).find(symbol => String(symbol).slice(7, -1) === privateField);
}
