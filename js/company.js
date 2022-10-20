import { Darkmode } from "./darkmode.js";

class Company {
    constructor(symbol) {
        this.symbol = symbol;

        this.#init();
    }

    async #init() {
        try {
            this.turnOnLoading();
            const profile = await this.getProfile(this.symbol);
            const stockHistoryEndpoint = 
                `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/historical-price-full/${this.symbol}?serietype=line`;
            const stockHistory = await this.getStockHistory(stockHistoryEndpoint);

            this.renderProfile(profile);

            this.renderHistoryChart(stockHistory);
        } catch(error) {
            console.log('error inside init:', error);
            this.renderError();
            return;
        } finally {
            this.turnOffLoading();
        }

    }

    async getProfile(symbol) {
        try {
            const url = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${symbol}`;
            const response = await fetch(url);
            const companyProfileData = await response.json();
            // console.log('companyProfileData: ', companyProfileData);
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
        // changePercentage *= -1;
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
    
    async getStockHistory(url) {
        try {
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
    const urlParams = new URLSearchParams(location.search)
    const symbol = urlParams.get("symbol"); 
    const company = new Company(symbol);

    document.getElementById('back-to-search').href = document.referrer;

    const darkmode = new Darkmode(document.getElementById('nav'));
}