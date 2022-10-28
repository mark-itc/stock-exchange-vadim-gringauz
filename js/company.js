import { serverURL } from './globals.js'
import { Darkmode } from "./darkmode.js";

class Company {
    constructor(container) {
        this.container = container;
        this.#init();
    }

    async #init() {
        try {
            await this.renderFrame();
            this.turnOnLoading();
            this.symbol = this.getSymbolFromURL();
            const profile = await this.getProfile(this.symbol);                
            this.renderProfile(profile);
            const stockHistory = await this.getStockHistory(this.symbol);
            this.renderHistoryChart(stockHistory);


        } catch(error) {
            console.log('error inside init:', error);
            this.renderError();
            return;
        } finally {
            this.turnOffLoading();
        }

    }
    
    getSymbolFromURL() {
        const urlParams = new URLSearchParams(location.search)
        return urlParams.get("symbol"); 
    }
    
    async renderFrame() {
        const spinnerDivHTML = `
            <!-- Preloading Spinner -->
            <div id="preloader" class="spinner-container d-flex align-items-center d-none">
                <div class="text-center w-100">
                    <div class="spinner-border text-danger" style="width: 10rem; height: 10rem;" role="status">
                        <span class="visually-hidden"></span>
                    </div>
                </div>
            </div>
        `;
        const errorDivHTML = `
            <!-- Error notification -->
            <div id="error-loading" class="alert alert-danger d-flex align-items-center d-none" role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                <div>
                Error Loading: Invalid Company Symbol
                </div>
            </div>
        `;
        const mainContainerHTML = `
            <!-- Main Container -->
            <div id="company-container" class="container-fluid custom-width p-3">
                <h1 class="text-center">Company Profile</h1>
                <div class="row justify-content-center">
                    <div id="symbol" class="col col-auto fs-2 text-center">[symbol]</div>
                </div>
                <div class="row justify-content-between align-items-center">
                    <div class="col-auto">
                        <a id="name" href="" target="_blank" class="text-danger display-6 text-align-middle">[Name]</a>
                        <!-- <h2 id="name" class="text-danger text-align-middle">[Name]</h2> -->
                    </div>
                    <div class="col-auto">
                        <img id="image" src="https://www.svgrepo.com/show/92170/not-available-circle.svg" alt="$name + logo" style="max-height: 150px;">
                    </div>
                </div>
                <div class="row">
                    <div class="col col-auto">
                        <div id="description" class="row">[Description]</div>
                    </div>
                </div>
                <div class="row align-items-center">
                    <div class="col-auto fs-2">Stock Price:</div>
                    <div id="price" class="col-auto fs-2">[Stock Price]</div>
                    <div id="change" class="col-auto fw-bolder fs-3">[stock changes Percentage]</div>
                </div>
                <div id="chart-container" class="row">
                    <div class="col-12">
                        <canvas id="myChart"></canvas>
                    </div>
                </div>
            </div>
        `;
        const frameDiv = document.createElement('div');
        frameDiv.innerHTML = spinnerDivHTML + errorDivHTML + mainContainerHTML;
        document.body.appendChild(frameDiv);
    }

    async getProfile(symbol) {
        try {
            const url = `${serverURL}/company/profile/${symbol}`;
            const response = await fetch(url);
            const companyProfileData = await response.json();
            if (companyProfileData.symbol) {
                return companyProfileData;
            } else {
                return {
                   symbol: symbol,
                   profile: {
                    companyName: "N/A",
                    website: "N/A",
                    description: "N/A",
                    image: "https://cdn-icons-png.flaticon.com/512/16/16096.png",
                    price: "0.00",
                    changesPercentage: 0
                   } 
                }
            }
        } catch(error) {
            console.log('error inside getProfile:', error);
            this.presentError();
            return;
        } 
    }

    renderProfile(profile) {
        document.getElementById('name').innerHTML = profile.profile.companyName;
        document.getElementById('name').href = profile.profile.website;
        document.getElementById('symbol').innerHTML = profile.symbol;
        document.getElementById('description').innerHTML = profile.profile.description;

        const img = document.getElementById('image');
        img.src = profile.profile.image;
        img.alt = profile.profile.companyName + " logo";
        img.addEventListener('error', () => {
            img.src = "https://www.svgrepo.com/show/92170/not-available-circle.svg";
        });

        document.getElementById('price').innerHTML = "$" + profile.profile.price;
        let changePercentage  = parseFloat(profile.profile.changesPercentage).toFixed(2);
        const changeDiv =  document.getElementById('change');
        if (changePercentage < 0) {
            changeDiv.classList.add('text-danger');
            changeDiv.innerHTML = `(${changePercentage}%)`;
        } else if (changePercentage > 0) {
            changeDiv.classList.add('text-success');
            changeDiv.innerHTML = `(+${changePercentage}%)`;
        } else {
            changeDiv.innerHTML = `(${changePercentage}%)`;
        }
    }
    
    async getStockHistory(symbol) {
        try {
            const url = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/historical-price-full/${symbol}?serietype=line`;
            const response = await fetch(url);
            const stockHistoryData = await response.json();
            return stockHistoryData;
        } catch(error) {
            console.log('error inside getStockHistory:', error);
            presentError(error.message);
            return;
        } 
    }

    turnOnLoading() {
        document.getElementById('company-container').classList.add('d-none');
        document.getElementById('preloader').classList.remove('d-none');
    }
    turnOffLoading() {
        document.getElementById('company-container').classList.remove('d-none');
        document.getElementById('preloader').classList.add('d-none');
    }

    renderHistoryChart(history) {        
        const chartContext = document.getElementById('myChart').getContext('2d');
        const chartConfig = {
            type: 'line',
            data: {
                datasets: [{
                    label: 'closing price',
                    data: history.historical,
                    fill: true,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    pointRadius: 0
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `${history.symbol} Stock-price History`
                    }
                },
                parsing: {
                    xAxisKey: 'date',
                    yAxisKey: 'close'
                },
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        reverse: true
                    }
                }
            }
        }

        const myChart = new Chart(chartContext, chartConfig);
    }

    presentError() {
        console.log('presentError');
        document.getElementById('company-container').classList.add('invisible');
        document.getElementById('error-loading').classList.remove('d-none');
    }
}


window.onload = () => {
    document.getElementById('back-to-search').href = document.referrer;
    
    const company = new Company(document.body);
    const darkmode = new Darkmode(document.getElementById('nav'));
}