let search = {};

class Search {
    constructor(properties) {
        this.endPoint = properties.endPoint;
        this.limit = properties.limit;
        this.exchange = properties.exchange;
        this.searchInput = document.getElementById('search-input');
        this.tableBody = document.getElementById('result-table-body');
        this.#init();
    }

    #init() {
        document.getElementById('search-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            this.runSearch(this.searchInput.value);
        });

        const urlParams = new URLSearchParams(location.search)
        const searchQuery = urlParams.get("query");
        if (searchQuery) {
            console.log('the query=', searchQuery);
            this.runSearch(searchQuery);
        }       
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

    renderResults(searchResults) {
        console.log('results inside renderResults:', searchResults);
        searchResults.forEach(async(searchResult, index) => {
            console.log(index + ':' + searchResult.name);
            const template = document.getElementById('search-result-template');
            const clone = template.content.cloneNode(true);
            const tr = clone.getElementById('search-result-');
            tr.id += index;
            const a = clone.querySelector('a');
            a.href = `./company.html?symbol=${searchResult.symbol}`;
            a.innerHTML = `${searchResult.name}`;
            const symbolSpan = clone.querySelector('.symbol');
            symbolSpan.innerHTML = `(${searchResult.symbol})`;
            
            const moreDetails = await this.getCompSpecs(searchResult.symbol);
            console.log('moreDetails', moreDetails);
            const img = clone.querySelector('img');
            img.src = moreDetails.image;
            const changesSpan = clone.querySelector('.changes');
            let changesAsPercentage  = parseFloat(moreDetails.changes).toFixed(2);
            // changesAsPercentage *= -1; 
            if (changesAsPercentage < 0) {
                changesSpan.classList.add('text-danger');
                changesSpan.innerHTML = `(${changesAsPercentage}%)`;
            } else if (changesAsPercentage > 0) {
                changesSpan.classList.add('text-success');
                changesSpan.innerHTML = `(+${changesAsPercentage}%)`;
            }

            
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

    async runSearch(searchTerm) {
        this.reset();
        // console.log('searchInput: ', searchTerm);
        const endpointURL = `
            ${this.endPoint}?query=${searchTerm}&limit=${this.limit}&exchange=${this.exchange}
        `;
        this.renderResults(await this.getSearchResults(endpointURL));
        this.modifyLocationQuery(searchTerm);
    }

    debounceSearch(timeToWait) {
        let timeout;
    
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                console.log('after a while');
                console.log('search.searchInput.value=', this.searchInput.value);
                this.runSearch(this.searchInput.value);
            }, timeToWait); 
        }
    }

    modifyLocationQuery(searchTerm) {
        const urlParams = new URLSearchParams(location.search)
        urlParams.set('query', searchTerm);        
        const nextURL = location.origin + location.pathname + '?' + urlParams.toString();
        const nextState = { additionalInformation: '' };
        const nextTitle = "Stock Exchange Project"
        window.history.replaceState(nextState, nextTitle, nextURL);
    }

    async getCompSpecs(symbol) {
        try {
            const url = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${symbol}`;
            const response = await fetch(url);
            const companyProfileData = await response.json();
            // console.log('companyProfileData: ', companyProfileData);
            return {
                image: companyProfileData.profile.image,
                changes: companyProfileData.profile.changes
            };
        } catch(error) {
            console.log('error inside getCompSpecs:', error);
            return;
        } 
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

function debounceSearch1(timeToWait) {
    let timeout;

    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(async() => {
            console.log('after a while');
            console.log('search.searchInput.value=', search.searchInput.value);
            search.reset();
            console.log('searchInput: ', search.searchInput.value);
            const endpointURL = `
                ${search.endPoint}?query=${search.searchInput.value}&limit=${search.limit}&exchange=${search.exchange}
            `;
            search.renderResults(await search.getSearchResults(endpointURL));
        }, timeToWait); 
    }
}

window.onload = () => { 
    // const app = new App();
    const searchProperties = {
        endPoint: 'https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search',
        limit: 10,
        exchange: 'NASDAQ'
    }
    search = new Search(searchProperties);
    const autoSearch = search.debounceSearch(500);
    search.searchInput.addEventListener('input', autoSearch);
}