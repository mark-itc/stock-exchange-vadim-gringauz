/* *********************************************
*         JS Project #2 - Stock Exchange       * 
*               SearchForm.js:                 *
*         All search form functionality        *
* **********************************************/

export class SearchForm {
    constructor(container) {
        this.container = container;
        this.endPoint = 'https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search';
        this.limit = 10;
        this.exchange = 'NASDAQ';
        this.searchInput = {};   // maybe can delete this
        this.isSearching = false;

        this.#init();
    }

    async #init() {
        await this.renderForm();
        this.searchInput = document.getElementById('search-input');
        
        document.addEventListener('turnOffLoading', this.turnOffLoading);

        /*RUN SEARCH ON FORM-SUBMIT*/
        document.getElementById('search-form').addEventListener('submit', async(event) => {
            event.preventDefault();
            if (!this.isSearching) {
                this.isSearching = true;
                const runSearchEvent = new CustomEvent("runSearch", {detail: {term: this.searchInput.value}});
                document.dispatchEvent(runSearchEvent);
            }
        });

        /*RUN SEARCH AUTOMATICALLY ON TYPING (WITH DELAY!)*/
        const autoSearch = this.debounceSearch(500);
        this.searchInput.addEventListener('input', autoSearch);

        /*RUN SEARCH ON PAGE-LOAD IF THERE ARE PARAMS IN URL*/
        this.runSearchFromUrlParams();
    }

    async renderForm() {
        const HTML = `
            <form class="" id="search-form" role="search">
                <div class="row justify-content-evenly m-3 g-0">
                    <div class="col-9">
                        <input id="search-input" class="form-control w-100 me-2" type="search" placeholder="Search Company" aria-label="Search" spellcheck="false">
                    </div>
                    <div class="col-auto">
                        <button id="search-button" class="btn btn-outline-dark" style="width: 130px" type="submit">
                            <span id="search-spinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                            <span id="search-button-text">Search</span>
                        </button>
                    </div>
                </div>
            </form>
        `;
        this.container.innerHTML = HTML;
    }

    runSearchFromUrlParams() {
        const urlParams = new URLSearchParams(location.search)
        const searchQuery = urlParams.get("query");
        if (searchQuery) {
            this.searchInput.value = searchQuery;
            this.runSearch(searchQuery);
            const runSearchEvent = new CustomEvent("runSearch", {detail: {term: searchQuery}});
            document.dispatchEvent(runSearchEvent);
        }
    }

    async runSearch(searchTerm) {
        try {
            console.log('start of search for term=', searchTerm);
            this.turnOnLoading();
            this.modifyLocationQuery(searchTerm);
            if (searchTerm.length === 0) {return [];}

            const endpointURL = `
                ${this.endPoint}?query=${searchTerm}&limit=${this.limit}&exchange=${this.exchange}
            `;
            const searchResults = await this.getSearchResults(endpointURL);
            // console.log('searchResults=', searchResults);
            
            // GET ADDITIONAL DATA (IMG+PRICE) FOR EACH COMPANY
            const symbolsFromResults = this.extractSymbols(searchResults);
            const resultsOnlyAdditionalData = await this.getAdditionalData(symbolsFromResults);
            const searchResultsFullData = [];
            searchResults.forEach((result, index) => {
                const newResult = {
                    ...result,
                    ...resultsOnlyAdditionalData[index]
                };
                searchResultsFullData.push(newResult);
            });
            return searchResultsFullData;            
        } catch(error) {
            console.log('Error caught inside runSearch', error);
            return [];
        } finally {
            this.isSearching = false;
            this.turnOffLoading();
        }
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

    async getMultipleCompanyProfiles(partialProfiles, symbols) {
        try {
            let url = "https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/";
            const symbolsString = symbols.toString();
            url += symbolsString;
            const response = await fetch(url);
            const data = await response.json();
            // console.log('data', data);
            
            if (symbols.length === 1) {
                if (data.symbol) {
                    const companySpecs = {
                        symbol: data.symbol,
                        image: data.profile.image,
                        changesPercentage: data.profile.changesPercentage
                    }
                    partialProfiles.push(companySpecs);
                    return partialProfiles;
                } else {
                    /* SOME COMPANY SYMBOLS RETURN EMPTY OBJECT FROM 'COMPANY-DATA' ENDPOINT */
                    return [{
                        symbol: symbols[0],
                        image: "https://cdn-icons-png.flaticon.com/512/16/16096.png",
                        changesPercentage: 0
                       
                    }];
                }
                
            }
            const fixedData = this.compensateMissingProfile(symbols, data);
            fixedData.companyProfiles.forEach((profile) => {
                const companySpecs = {
                    symbol: profile.symbol,
                    image: profile.profile.image,
                    changesPercentage: profile.profile.changesPercentage
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

    /* SOME COMPANY SYMBOLS RETURN EMPTY OBJECT FROM 'COMPANY-DATA' ENDPOINT */
    compensateMissingProfile(symbols, data) {
        if (symbols.length === data.companyProfiles.length) {
            /* NO NEED TO COMPENSATE */
            return data;
        } else {
            symbols.forEach((symbol) => {
                if (!data.companyProfiles.find(element => element.symbol === symbol)) {
                    console.log('does not exist:', symbol);
                    const missingProfile = {
                        symbol: symbol,
                        profile: {
                            image: "https://cdn-icons-png.flaticon.com/512/16/16096.png",
                            changesPercentage: 0
                        }
                    };
                    data.companyProfiles.push(missingProfile);
                }
            });
            return data;
        }
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


    debounceSearch(timeToWait) {
        let timeout;
    
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (!this.isSearching) {
                    this.isSearching = true;
                    const runSearchEvent = new CustomEvent("runSearch", {detail: {term: this.searchInput.value}});
                    document.dispatchEvent(runSearchEvent);
                }
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

    onSearch(renderResults) {
        document.addEventListener('runSearch', async(event) => {
            const resultsFromSearch = await this.runSearch(event.detail.term);
            renderResults(resultsFromSearch, event.detail.term);
        });
    }
}


