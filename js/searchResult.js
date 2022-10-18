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
    }

    async renderHTML() {
        const HTML = `
            <div id="search-found" class="d-none">
                <table class="table table-hover table-borderless">
                    <thead></thead>
                    <tbody id="result-table-body"></tbody>
                </table>
            </div>

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
        this.container.appendChild(noMatchDiv);
    }

    async reset() {
        document.getElementById('search-not-found').classList.add('d-none');
        this.tableBody.innerHTML = '';
    }

    async renderResults(searchResults, searchedTerm) {
        if (searchResults.length === 0) {
            document.getElementById('search-found').classList.add('d-none');
            document.getElementById('search-not-found').classList.remove('d-none');
            return;
        }

        await this.reset();
        // console.log('full searchResults=', searchResults);
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
                console.log('error loading img');
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
            this.tableBody.appendChild(clone);
        });
        document.getElementById('search-found').classList.remove('d-none');
        this.slideInTable();
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

    highlightTerm(term, string) {
        let newString = "";
        const regexTerm = new RegExp(term, 'i');
        newString = string.replace(regexTerm,`<mark>$&</mark>`);
        return newString;
    }
}