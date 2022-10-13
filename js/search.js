
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
        /*RUN SEARCH ON FORM-SUBMIT*/
        document.getElementById('search-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            this.runSearch(this.searchInput.value);
        });

        /*RUN SEARCH AUTOMATICALLY ON TYPING (WITH DELAY!)*/
        const autoSearch = this.debounceSearch(500);
        this.searchInput.addEventListener('input', autoSearch);

        /*RUN SEARCH ON PAGE-LOAD IF THERE ARE PARAMS IN URL*/
        this.runSearchFromUrlParams();
    }

    runSearchFromUrlParams() {
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
            const response = await fetch(url);
            const allSearchResults = await response.json();
            // console.log('allSearchResults: ', allSearchResults);
            return allSearchResults;
        } catch(error) {
            console.log('error:', error);
            return;
        } 
    }

    async renderResults(searchResults) {
        const symbolsFromResults = this.extractSymbols(searchResults);
        const resultsAdditionalData = await this.getAdditionalData(symbolsFromResults);
        searchResults.forEach(async(searchResult, index) => {
            // console.log(index + ':' + searchResult.name);
            const template = document.getElementById('search-result-template');
            const clone = template.content.cloneNode(true);
            clone.getElementById('search-result-').id += index;
            const a = clone.querySelector('a');
            a.href = `./company.html?symbol=${searchResult.symbol}`;
            a.innerHTML = `${searchResult.name}`;
            clone.querySelector('.symbol').innerHTML = `(${searchResult.symbol})`;
            
            // LEGACY: previous method
            // const moreDetails = await this.getCompSpecs(searchResult.symbol);
            // clone.querySelector('img').src = moreDetails.image;
            // const changesSpan = clone.querySelector('.changes');
            // let changesAsPercentage  = parseFloat(moreDetails.changes).toFixed(2);

            const matchingAdditionalData = resultsAdditionalData.filter(result => result.symbol === searchResult.symbol);
            clone.querySelector('img').src = matchingAdditionalData[0].image;
            const changesSpan = clone.querySelector('.changes');
            let changesAsPercentage  = parseFloat(matchingAdditionalData[0].changesPercentage).toFixed(2);

            // changesAsPercentage *= -1; 
            if (changesAsPercentage < 0) {
                changesSpan.classList.add('text-danger');
                changesSpan.innerHTML = `(${changesAsPercentage}%)`;
            } else if (changesAsPercentage > 0) {
                changesSpan.classList.add('text-success');
                changesSpan.innerHTML = `(+${changesAsPercentage}%)`;
            } else {
                changesSpan.innerHTML = `(${changesAsPercentage}%)`;
            }
            this.tableBody.appendChild(clone);
        })
    }

    async runSearch(searchTerm) {
        try {
            this.turnOnLoading();
            this.reset();
            // console.log('searchInput: ', searchTerm);
            const endpointURL = `
                ${this.endPoint}?query=${searchTerm}&limit=${this.limit}&exchange=${this.exchange}
            `;
            await this.renderResults(await this.getSearchResults(endpointURL));
            this.modifyLocationQuery(searchTerm);
        } catch(error) {
            console.log('Error caught inside runSearch', error);
        } finally {this.turnOffLoading();}
    }

    debounceSearch(timeToWait) {
        let timeout;
    
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
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

    // LEGACY: previous method
    // async getCompSpecs(symbol) {
    //     try {
    //         const url = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${symbol}`;
    //         const response = await fetch(url);
    //         const companyProfileData = await response.json();
    //         // console.log('companyProfileData: ', companyProfileData);
    //         return {
    //             image: companyProfileData.profile.image,
    //             changes: companyProfileData.profile.changes
    //         };
    //     } catch(error) {
    //         console.log('error inside getCompSpecs:', error);
    //         return;
    //     } 
    // }

    async getMultipleCompanyProfiles(partialProfiles, symbols) {
        try {
            let url = "https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/";
            const symbolsString = symbols.toString();
            url += symbolsString;
            const response = await fetch(url);
            const data = await response.json();
            // console.log('data', data);
            if (symbols.length === 1) {
                const companySpecs = {
                    symbol: data.symbol,
                    image: data.profile.image,
                    changes: data.profile.changes
                }
                partialProfiles.push(companySpecs);
                return partialProfiles;
            }
            data.companyProfiles.forEach((profile) => {
                const companySpecs = {
                    symbol: profile.symbol,
                    image: profile.profile.image,
                    changes: profile.profile.changes
                }
                partialProfiles.push(companySpecs);
            });
            return partialProfiles;
        } catch(error) {
            console.log('error inside get Multiple Company Profiles:', error);
            return;
        } 
    }

    async getAdditionalData(allResultSymbols) {
        let partialProfiles = [];
        let removedSymbols;
        while (allResultSymbols.length > 0) {
            removedSymbols = allResultSymbols.splice(0,3);
            partialProfiles = await this.getMultipleCompanyProfiles(partialProfiles, removedSymbols);
        }
        return partialProfiles;
    }

    extractSymbols(searchResults) {
        let symbols = searchResults.map(({ symbol }) => symbol)
        return symbols;
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

window.onload = () => { 
    const searchProperties = {
        endPoint: 'https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search',
        limit: 10,
        exchange: 'NASDAQ'
    }
    const search = new Search(searchProperties);
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