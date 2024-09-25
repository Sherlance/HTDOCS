// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Function to fetch water level data from the API
async function fetchWaterLevelData() {
    try {
        // Fetch data from the API
        const response = await fetch('https://iot.csfp.io/csfpiot/v1/api/waterlevel/get?fbclid=IwY2xjawFd18BleHRuA2FlbQIxMAABHbKTqLCPdqFWHS14DlqnW7pI9Xgp2p7IryseUPEps6L-utycef0HIvMk3A_aem_mUQw7Hjdtfrc88T5Bm6q1Q');
        const data = await response.json();

        // Check if data is available
        if (!data || data.length === 0) {
            document.getElementById('info').innerText = 'No data available';
            return;
        }

        // Extract Time, Level, and relevant info
        const labels = [];
        const levels = [];
        let location = "";
        let date = "";

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const entry = data[key];
                const time = new Date(entry.Time);  // Convert Time to Date object
                const timeStr = time.toLocaleTimeString();  // Extract time

                // Push only time into labels (X-axis)
                labels.push(timeStr);
                levels.push(entry.Level);  // Y-axis: Water Level
                location = entry.Location; // Store location (assuming it is the same for all entries)

                // Capture the date only once (assuming all entries are from the same day)
                if (!date) {
                    date = time.toLocaleDateString();
                }
            }
        }

        // Total Data Points
        const totalDataPoints = labels.length;

        // Update the Date, Location, and Total Data Points in the UI
        document.getElementById('date').textContent = date;  // Assuming 'date' element is present in HTML
        document.getElementById('location').textContent = location;  // Assuming 'location' element is present in HTML
        document.getElementById('totalDataPoints').textContent = totalDataPoints;  // Assuming 'totalDataPoints' element is present in HTML

        // Call the function to create the line chart with fetched data
        createLineChart(labels, levels);

    } catch (error) {
        console.error('Error fetching water level data:', error);
        document.getElementById('info').innerText = 'Failed to fetch data from the API';
    }
}

// Function to create the line chart
function createLineChart(labels, levels) {
    const ctx = document.getElementById('waterLevelChart').getContext('2d');
    const waterLevelChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,  // X-axis: Time (without the date)
            datasets: [{
                label: 'Water Level',
                data: levels,  // Y-axis: Water Level
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointRadius: 3,
                pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointBorderColor: 'rgba(78, 115, 223, 1)',
                pointHoverRadius: 3,
                pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                pointHitRadius: 10,
                pointBorderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    ticks: {
                        // Set specific y-axis ticks
                        values: [1, 3, 5],  // Custom y-axis values
                        maxTicksLimit: 5,
                        padding: 10,
                        beginAtZero: true,
                        callback: function(value, index, values) {
                            return number_format(value);
                        }
                    },
                    gridLines: {
                        color: "rgb(234, 236, 244)",
                        zeroLineColor: "rgb(234, 236, 244)",
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function(tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
                    }
                }
            }
        }
    });
}

// Number formatting function
function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(',', '').replace(' ', '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function(n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

// Fetch the water level data when the page loads
window.onload = fetchWaterLevelData;
