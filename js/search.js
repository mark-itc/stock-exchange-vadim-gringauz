
class Search {
    constructor(properties) {
        this.endPoint = properties.endPoint;
        this.limit = properties.limit;
        this.exchange = properties.exchange;
        this.tableBody = document.getElementById('result-table-body');
        this.#init();
    }

    #init() {
        const searchInput = document.getElementById('search-input');
        document.getElementById('search-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            this.reset();
            console.log('searchInput: ', searchInput.value);
            const endpointURL = `
                ${this.endPoint}?query=${searchInput.value}&limit=${this.limit}&exchange=${this.exchange}
            `;
            this.presentResults(await this.getSearchResults(endpointURL));
        });

        // searchInput.addEventListener('input', async (event) => {
        //     console.log('on input:', searchInput.value);
        //     let timeout;
        //     return function sendSearch() {
        //         console.log('inside');
        //         clearTimeout(timeout);
        //         timeout = setTimeout(async () => {
        //             clearTimeout(timeout);
        //             this.reset();
        //             console.log('search keyword: ', searchInput.value);
        //             const endpointURL = `
        //                 ${this.endPoint}?query=${searchInput.value}&limit=${this.limit}&exchange=${this.exchange}
        //             `;
        //             this.presentResults(await this.getSearchResults(endpointURL));
        //         }, 300);
        //     };
        // });          
    }

    reset() {
        this.tableBody.innerHTML = '';
    }

    async getSearchResults(url) {
        try {
            this.turnOnLoading();
            const response = await fetch(url);
            const allSearchResults = await response.json();
            // console.log('allSearchResults: ', allSearchResults);
            return allSearchResults;
        } catch(error) {
            console.log('error:', error);
            return;
        } finally {this.turnOffLoading();}
    }

    presentResults(searchResults) {
        console.log('results inside presentResults:', searchResults);
        searchResults.forEach((searchResult, index) => {
            console.log(index + ':' + searchResult.name);
            const template = document.getElementById('search-result-template');
            const clone = template.content.cloneNode(true);
            const tr = clone.getElementById('search-result-');
            tr.id += index;
            const a = clone.querySelector('a');
            a.href = `./company.html?symbol=${searchResult.symbol}`;
            a.innerHTML = `${searchResult.name} (${searchResult.symbol})`;
            this.tableBody.appendChild(clone);


            // const resultTr = document.createElement('tr');
            // resultTr.id = `search-result-${index}`;
            // resultTr.innerHTML = `
            //     <th scope="row"></th>
            //     <td><a href="./company.html?symbol=${searchResult.symbol}">${searchResult.name} (${searchResult.symbol})</a></td>
            // `;
            // this.tableBody.appendChild(resultTr);
        })

    }

    turnOnLoading() {
        document.getElementById('search-button').classList.add('disabled');
        document.getElementById('search-spinner').classList.remove('d-none');
        document.getElementById('search-button-text').innerHTML = "Searching...";
    }

    turnOffLoading() {
        document.getElementById('search-button').classList.remove('disabled');
        document.getElementById('search-spinner').classList.add('d-none');
        document.getElementById('search-button-text').innerHTML = "Search";
    }
}

// class App {
//     constructor() {
//         this.#init();
//     }

//     #init() {
//         const searchFormProperties = {
//             url: ""
//         }
        
//         const search = new Search(searchFormProperties);
        
//     }
// }

window.onload = () => {
    // const app = new App();
    const searchProperties = {
        endPoint: 'https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search',
        limit: 10,
        exchange: 'NASDAQ'
    }
    const search = new Search(searchProperties);
}