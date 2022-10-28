/* *********************************************
*         JS Project #2 - Stock Exchange       * 
*              SearchResult.js:                *
*       All search results functionality       *
* **********************************************/
import { imgNotAvailable } from './globals.js'
export class SearchResult {
    constructor(container) {
        this.container = container;
        this.#init();
    }

    async #init() {
        await this.renderHTML();     
    }

    async reset() {
        this.foundDiv.classList.add('d-none');
        this.foundDiv.innerHTML = '';
        this.notFoundDiv.classList.add('d-none');
        this.errorMsgDiv.classList.add('d-none');
        this.errorMsgDiv.innerHTML = "";
    }

    async renderResults(searchResults, searchedTerm) {
        await this.reset();
        // console.log('in render:', searchResults);
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
                clone.querySelector('a').href = `./company.html?symbol=${searchResult.symbol}`;
                clone.querySelector('.name').innerHTML = `${this.highlightTerm(searchedTerm, searchResult.name)}`;
                clone.querySelector('.symbol').innerHTML = `(${this.highlightTerm(searchedTerm, searchResult.symbol)})`;
                const img = clone.querySelector('img');
                img.src = searchResult.image;
                img.addEventListener('error', () => {
                    img.src = imgNotAvailable;
                });
                clone.querySelector('.changes').innerHTML = this.fixedValueOfChanges(searchResult.changesPercentage);
                this.foundDiv.appendChild(clone);
            });
            this.foundDiv.classList.remove('d-none');
            this.slideInResults();
        }
    }

    fixedValueOfChanges(changesValue) {
        let changesAsPercentage  = parseFloat(changesValue).toFixed(2);

        if (changesAsPercentage < 0) {
            return `<span class="text-danger">(${changesAsPercentage}%)</span>`;
        }
        if (changesAsPercentage > 0) {
            return `<span class="text-success">(+${changesAsPercentage}%)</span>`;
        } 
        if (changesAsPercentage == 0) {
            return `(${changesAsPercentage}%)`;
        }
    }

    slideInResults() {
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

    async renderHTML() {
        const divsHTML = `
            <div id="search-found" class="d-none"></div>
            <div id="search-error-msg"></div>
        `;
        const templateHTML = `
            <template id="search-result-template">
                <div id="search-result-" class="d-flex flex-row result-row justify-content-between overflow-visible">
                    <a class="a-results h-100 w-100" href="">
                        <div class="d-flex align-items-end gap-2 w-100">
                            <img  style="height: 30px;" class="img-thumbnail" src="${imgNotAvailable}" alt="">
                            <span class="name">[Name]</span>
                            <span class="symbol text-secondary">([Symbol])</span>
                            <span class="changes ms-auto">([changes])</span>
                        </div>
                    </a>
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
}