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
    }

    async renderHTML() {
        const divsHTML = `
            <div id="search-found" class="d-none">


            <!--
                <table class="table table-hover table-borderless">
                    <thead></thead>
                    <tbody id="result-table-body"></tbody>
                </table>
            -->
            </div>
            

            <div id="search-error-msg"></div>
        `;
        const templateHTML = `
            <template id="search-result-template">
                <div id="search-result-" class="d-flex flex-row result-row justify-content-between align-items-end pt-2 overflow-visible">
                    <div class="d-flex flex-row align-items-end">
                        <div>
                            <img  style="height: 30px;" class="img-thumbnail" src="https://www.svgrepo.com/show/92170/not-available-circle.svg" alt="">
                        </div>
                        <div class="ms-2" style="height: 33px;">
                            <a class="fs-4 overflow-hidden text-nowrap" href="">[Name]</a>
                        </div>
                        <div class="ms-2">
                            <span class="symbol text-secondary">([Symbol])</span>
                        </div>
                    </div>
                    <div class="d-flex flex-row">
                        <div>
                            <span class="changes">([changes])</span>
                        </div>
                    </div>
                </div>
            </template>
        `;
        this.container.innerHTML = divsHTML + templateHTML;
        
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
        this.container.appendChild(noMatchDiv);

        this.foundDiv = document.getElementById('search-found');
        this.notFoundDiv = document.getElementById('search-not-found');
        this.errorMsgDiv = document.getElementById('search-error-msg');
    }

    async reset() {
        this.foundDiv.classList.add('d-none');
        this.foundDiv.innerHTML = '';
        this.notFoundDiv.classList.add('d-none');
        this.errorMsgDiv.classList.add('d-none');
        this.errorMsgDiv.innerHTML = "";
    }

    async renderResults(searchResults, searchedTerm) {
        // console.log('searchResults=', searchResults, "searchedTerm", searchedTerm);
        await this.reset();
        
        if (searchResults.length === 0) {
            // EMPTY ARRAY = NO MATCH WAS FOUND
            document.getElementById('search-not-found').classList.remove('d-none');
            return;
        } else if (searchResults.length > 20) {
            // TO AVOID A BUG WHEN THE API RETURNS TO MANY OBJECTS BY MISTAKE, LIKE WHEN INPUT="#"
            this.errorMsgDiv.innerHTML = `Too many search results for: <b>${searchedTerm}</b>!`;
            this.errorMsgDiv.classList.remove('d-none');
            return;
        } else {
            // RENDER THE RESULTS ONLY WHEN:  0 < NUM OF RESULTS < 20
            searchResults.forEach(async(searchResult, index) => {
                const template = document.getElementById('search-result-template');
                const clone = template.content.cloneNode(true);
                clone.getElementById('search-result-').id += index;
                const a = clone.querySelector('a');
                a.href = `./company.html?symbol=${searchResult.symbol}`;
                a.innerHTML = `${this.highlightTerm(searchedTerm, searchResult.name)}`;
                clone.querySelector('.symbol').innerHTML = `(${this.highlightTerm(searchedTerm, searchResult.symbol)})`;
                const img = clone.querySelector('img');
                img.src = searchResult.image;
                img.addEventListener('error', () => {
                    img.src = "https://www.svgrepo.com/show/92170/not-available-circle.svg";
                });
                const changesSpan = clone.querySelector('.changes');
                let changesAsPercentage  = parseFloat(searchResult.changesPercentage).toFixed(2);
    
                if (changesAsPercentage < 0) {
                    changesSpan.classList.add('text-danger');
                    changesSpan.innerHTML = `(${changesAsPercentage}%)`;
                } else if (changesAsPercentage > 0) {
                    changesSpan.classList.add('text-success');
                    changesSpan.innerHTML = `(+${changesAsPercentage}%)`;
                } else {
                    changesSpan.innerHTML = `(${changesAsPercentage}%)`;
                }
                this.foundDiv.appendChild(clone);
            });
            this.foundDiv.classList.remove('d-none');
            this.slideInTable();
        }
    }

    slideInTable() {
        const rows = Array.from(document.querySelectorAll('.result-row'));

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

    highlightTerm(term, string) {
        let newString = "";
        const regexTerm = new RegExp(term, 'i');
        newString = string.replace(regexTerm,`<mark>$&</mark>`);
        return newString;
    }
}