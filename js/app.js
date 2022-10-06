
class Search {
    constructor(properties) {
        this.url = properties.url;
        this.tableBody = document.getElementById('result-table-body');
        this.#init();
    }

    #init() {

        document.getElementById('search-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            this.reset();
            const searchInput = document.getElementById('search-input').value;
            console.log('searchInput: ', searchInput);
            const endpointURL = `
                https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search?query=${searchInput}&limit=10&exchange=NASDAQ
            `;
            this.presentResults(await this.getSearchResults(endpointURL));
        });
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
            
            const resultTr = document.createElement('tr');
            resultTr.id = `search-result-${index}`;
            resultTr.innerHTML = `
                <th scope="row"></th>
                <td><a href="#">${searchResult.name} (${searchResult.symbol})</a></td>
            `;
            this.tableBody.appendChild(resultTr);
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

class App {
    constructor() {
        this.#init();
    }

    #init() {
        const searchFormProperties = {
            url: "https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search?query=AA&limit=10&exchange=NASDAQ"

        }
        
        const search = new Search(searchFormProperties);
        
    }
}

window.onload = () => {
    const app = new App();
}