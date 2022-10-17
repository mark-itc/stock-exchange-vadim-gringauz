class Marquee {
    constructor(properties) {
        this.containerA = properties.containerA;
        this.containerB = properties.containerB;
        this.limit = properties.limit;
        this.itemWidth = 61;
        this.#init();
    }
    
    async #init() {
        this.renderData(await this.getData(this.limit));
    }

    async getData(limit) {
        try {
            const url = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/stock-screener?exchange=NASDAQ&limit=${limit}`;
            const response = await fetch(url);
            const fullData = await response.json();
            return fullData.map(({price, symbol}) => ({ symbol: symbol, price: price }));
        } catch(error) {
            console.log('Error inside get data:', error);
            return;
        }
    }

    renderData(stockPrices) {
        stockPrices = this.multiplyToFitWindow(stockPrices);
        this.renderSeriesOfItems(stockPrices, this.containerA, 'a');
        this.renderSeriesOfItems(stockPrices, this.containerB, 'b');
        
    }

    renderSeriesOfItems(stockPrices, container, seriesId) {
        stockPrices.forEach((stock, index) => {
            const template = document.getElementById('marquee-item-template');
            const clone = template.content.cloneNode(true);
            clone.getElementById('marquee-item-').id += `${seriesId}-${index}`;
            clone.querySelector('span').innerHTML = `${stock.symbol} ${stock.price}`;
            container.appendChild(clone);
        });
    }
    multiplyToFitWindow(stockPrices) {
        const numOfItemsOnWindow = parseInt(window.innerWidth/this.itemWidth);
        if(stockPrices.length < numOfItemsOnWindow) {
            const originalArray = stockPrices;
            for(let index = 0; index < numOfItemsOnWindow/originalArray.length-1; index++) {
                stockPrices = stockPrices.concat(originalArray);
            }
        }
        return stockPrices;
    }
    

}

const marqueeProperies = {
    containerA: document.getElementById('marquee-container-a'),
    containerB: document.getElementById('marquee-container-b'),
    limit: 100
}

let marquee = new Marquee(marqueeProperies);
window.addEventListener('resize', (event) => {
    marquee = new Marquee(marqueeProperies);
})
