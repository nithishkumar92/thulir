const apiKey = 'AIzaSyAwVNjzgZ2Q0XdOVPtzNUBYTqfZxfoie6I';
const spreadsheetId = '14xy2C6uXhbwAc_9u2ey8_kEPR2F-tsbLs-FLdZs7THM';
const range = 'English!A1:D46';

fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        const values = data.values;
        const table = document.getElementById('packageTable');
        const tbody = table.querySelector('tbody');

        values.forEach((row, rowIndex) => {
            const tableRow = document.createElement('tr');
            row.forEach((cell, cellIndex) => {
                const tableCell = document.createElement('td');

                // Add data labels for mobile view
                if (cellIndex > 0) {
                    const packageNames = ['Silver', 'Gold', 'Platinum'];
                    tableCell.setAttribute('data-label', packageNames[cellIndex - 1]);
                }

                if (cell === null) {
                    const prevCell = tableRow.cells[cellIndex - 1];
                    if (prevCell) {
                        const colspan = parseInt(prevCell.getAttribute('colspan') || '1', 10) + 1;
                        prevCell.setAttribute('colspan', colspan);
                        return;
                    }
                }

                if (cell && cell.startsWith('<b>') && cell.endsWith('</b>')) {
                    tableCell.innerHTML = cell;
                } else {
                    tableCell.textContent = cell;
                }

                tableRow.appendChild(tableCell);
            });
            tbody.appendChild(tableRow);
        });
    })
    .catch(error => console.error('Error fetching data:', error));

function toggleMenu() {
    var navLinks = document.getElementById("navLinks");
    navLinks.classList.toggle("show");
    if (navLinks.classList.contains("show")) {
        setTimeout(function () {
            navLinks.classList.remove("show");
        }, 5000);
    }
}