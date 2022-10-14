class Marquee {
    constructor(properties) {
        this.container = properties.container;
        this.#init();
    }
    
    async #init() {
        this.renderData(await this.getData(100));
    }

    async getData(limit) {
        try {
            const url = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/stock-screener?exchange=NASDAQ&limit=${limit}`;
            const response = await fetch(url);
            const fullData = await response.json();
            console.log('full Data=', fullData);
            return fullData.map(({price, symbol}) => ({ symbol: symbol, price: price }));
        } catch(error) {
            console.log('Error inside get data:', error);
            return;
        }
    }

    renderData(stockPrices) {
        console.log('stockPrices=', stockPrices);
        stockPrices.forEach((stock, index) => {
            const template = document.getElementById('marquee-item-template');
            const clone = template.content.cloneNode(true);
            clone.getElementById('marquee-item-').id += index;
            clone.querySelector('span').innerHTML = `${stock.symbol} ${stock.price}`;
            this.container.appendChild(clone);
        });
    }
}

const marqueeProperies = {
    container: document.getElementById('marquee-container')
}

const marquee = new Marquee(marqueeProperies);
