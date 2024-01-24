// bitcoin.js
async function getBitcoinPriceUSD() {
    try {
        const response = await fetch('https://api.coincap.io/v2/assets/bitcoin');
        const data = await response.json();
        return data.data.priceUsd; // Extracting the price of Bitcoin in USD
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        return 'Unavailable'; // Return a placeholder or error message
    }
}

export default getBitcoinPriceUSD;
