/* *********************************************
*         JS Project #2 - Stock Exchange       * 
*                 marquee.js:                  *
*     All index.html marquee functionality     *
* **********************************************/
import { serverURL } from './globals.js';
export class Marquee {
    constructor(properties) {
        this.container = properties.container;
        this.limit = properties.limit;
        this.itemWidth = 61;
    }
    
    async load() {
        await this.renderContainers();
        this.container.classList.remove('d-none');
        this.renderData(await this.getData(this.limit));
    }

    async getData(limit) {
        try {
            const url = `${serverURL}/stock-screener?exchange=NASDAQ&limit=${limit}`;
            const response = await fetch(url);
            const fullData = await response.json();
            return fullData.map(({price, symbol}) => ({ symbol: symbol, price: price }));
        } catch(error) {
            console.log('Error inside get data:', error);
            return;
        }
    }

    async renderContainers() {
        const HTML = `
            <div id="marquee-container-a" class="move first d-flex flex-nowrap"></div>
            <div id="marquee-container-b" class="move second d-flex flex-nowrap"></div>

            <template id="marquee-item-template" class="marquee-item">
                <span  id="marquee-item-" class="marquee-element m-2" style="flex-wrap: nowrap;">[symbol] [stock price]</span>
            </template>
        `;
        this.container.innerHTML = HTML;
    }

    renderData(stockPrices) {
        const containerA = document.getElementById('marquee-container-a');
        const containerB = document.getElementById('marquee-container-b');
        stockPrices = this.multiplyToFitWindow(stockPrices);
        this.renderSeriesOfItems(stockPrices, containerA, 'a');
        this.renderSeriesOfItems(stockPrices, containerB, 'b');
        
    }

    renderSeriesOfItems(stockPrices, container, seriesId) {
        stockPrices.forEach((stock, index) => {
            const template = document.getElementById('marquee-item-template');
            const clone = template.content.cloneNode(true);
            clone.getElementById('marquee-item-').id += `${seriesId}-${index}`;
            clone.querySelector('span').innerHTML = `${stock.symbol} $${stock.price}`;
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


