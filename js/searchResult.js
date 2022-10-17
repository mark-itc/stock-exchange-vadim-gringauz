/* *********************************************
*         JS Project #2 - Stock Exchange       * 
*              SearchResult.js:                *
*       All search results functionality       *
* **********************************************/

export class SearchResult {
    constructor(container) {
        this.container = container
        this.#init();
    }

    async #init() {
        await this.renderHTML();
        this.tableBody = document.getElementById('result-table-body');

        document.addEventListener('resetResults', (event) => {
            document.getElementById('search-results').classList.add('d-none');
            this.reset();
        });

        document.addEventListener('renderResults', async(event) => {
            if (event.detail.length === 0) {
                document.getElementById('search-not-found').classList.remove('d-none');
            } else {
                await this.renderResults(event.detail);
                document.getElementById('search-results').classList.remove('d-none');
                this.slideInTable();
            }
        });
        
    }

    async renderHTML() {
        const HTML = `
            <table class="table table-hover table-borderless">
                <thead></thead>
                <tbody id="result-table-body"></tbody>
            </table>

            <template id="search-result-template">
                <tr id="search-result-">
                    <th scope="row"></th>
                    <td class="">
                        <div class="row custom-height">
                            <div class="col-auto g-1">
                                <img  style="height: 30px;" class="img-thumbnail" src="https://www.svgrepo.com/show/92170/not-available-circle.svg" alt="">
                            </div>
                        </div>
                    </td>
                    <td class="overflow-hidden">
                        <div class="row custom-height align-items-end">
                            <div class="col-auto">
                                <a class="fs-4" href="">[Name]</a>
                                <span class="symbol text-secondary">([Symbol])</span>
                            </div>
                            <div class="col-auto">
                            </div>
                            <div class="col-auto">
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="row custom-height align-items-end">
                            <div class="col-auto mt-2">
                                <span class="changes">([changes])</span>
                            </div>
                        </div>
                    </td>
                </tr>
            </template>
        `;
        this.container.innerHTML = HTML;
        
        const noMatchDiv = document.createElement('div');
        noMatchDiv.id = "search-not-found";
        noMatchDiv.classList.add('d-none');
        noMatchDiv.innerHTML = `
            <div class="row justify-content-center align-items-center">
                <div class="col-2">
                    <img src="https://www.svgrepo.com/show/164118/sad.svg" class="img-fluid">
                </div>
                <div class="col-auto fs-3">Sorry, no match was found</div>
            </div>
        `;
        document.getElementById('main-container').appendChild(noMatchDiv);
    }

    reset() {
        document.getElementById('search-not-found').classList.add('d-none');
        this.tableBody.innerHTML = '';
    }

    async renderResults(searchResults) {
        try {
            const symbolsFromResults = this.extractSymbols(searchResults);
            const resultsAdditionalData = await this.getAdditionalData(symbolsFromResults);
            searchResults.forEach(async(searchResult, index) => {
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
                const img = clone.querySelector('img');
                img.src = matchingAdditionalData[0].image;
                img.addEventListener('error', () => {
                    console.log('error loading img');
                    img.src = "https://www.svgrepo.com/show/92170/not-available-circle.svg";
                });
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
            });

        } catch(error) {
            console.log('Error renderig:', error);
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

    slideInTable() {
        const rows = Array.from(document.querySelectorAll('tr'));

        function slideOut(row) {
          row.classList.add('slide-out');
        }
        
        function slideIn(row, index) {
          setTimeout(function() {
            row.classList.remove('slide-out');
          }, (index + 5) * 100);  
        }
        
        rows.forEach(slideOut);
        rows.forEach(slideIn); 
    }
}