// Function to fetch data from the Google Apps Script
async function fetchClauseData() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbzd7N3r6wgHPtx6VgwPlAyYQNna5cHHHPtimXnbhsqXFcsKZHRU6jKouC4tWwuXERk/exec');
        const data = await response.json();
        console.log(data.data);
        return data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

let selectedItems = [];
let clauseData = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Change const to let for elements that will be reassigned
    let searchInput = document.getElementById('searchInput');
    let searchResults = document.getElementById('searchResults');
    const builtTable = document.getElementById('builtTable');
    const copyButton = document.getElementById('copyButton');
    const clearButton = document.getElementById('clearButton');
    const searchSection = document.querySelector('.search-section');

    // Add initial loading state
    searchSection.innerHTML = `
        <div class="initial-loading">
            <div class="loading-spinner"></div>
            <p>Loading planning clauses...</p>
        </div>
    `;

    // Configure Toastr options
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    try {
        // Fetch data when page loads
        clauseData = await fetchClauseData();
        
        // Restore search section after data is loaded
        searchSection.innerHTML = `
            <input type="text" 
                   id="searchInput" 
                   placeholder="Search clauses (e.g., 43.02)..."
                   aria-label="Search clauses">
            <div id="searchResults" class="search-results"></div>
        `;
        
        // Re-assign elements after DOM update
        searchInput = document.getElementById('searchInput');
        searchResults = document.getElementById('searchResults');
        
        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm.length < 1) {
                searchResults.innerHTML = '';
                return;
            }

            simulateLoading();
            
            setTimeout(() => {
                const filteredResults = clauseData
                    .filter(item => 
                        item[0].toLowerCase().includes(searchTerm) || // Clause number
                        item[1].toLowerCase().includes(searchTerm)    // Zone name
                    )
                    .slice(0, 5);

                displaySearchResults(filteredResults);
            }, 300);
        });

        // Display search results
        function displaySearchResults(results) {
            searchResults.innerHTML = '';
            
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="empty-state">
                        No matching clauses found
                    </div>
                `;
                return;
            }

            results.forEach(item => {
                const isSelected = selectedItems.find(selected => selected[0] === item[0] && selected[3] === item[3]);
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.innerHTML = `
                    <div class="item-info">
                        <strong>${item[0]}</strong>
                        <span class="category">${item[1]}</span>
                    </div>
                    <div class="item-description">${item[3]}</div>
                    ${isSelected ? '<span class="selected-tick">✓</span>' : ''}
                `;
                resultItem.addEventListener('click', () => addToTable(item));
                searchResults.appendChild(resultItem);
            });
        }

        // Add item to table
        function addToTable(item) {
            if (!selectedItems.find(selected => selected[0] === item[0] && selected[3] === item[3])) {
                selectedItems.push(item);
                updateBuiltTable();
                
                // Highlight the newly added row
                const lastRow = document.querySelector('tbody tr:last-child');
                if (lastRow) {
                    lastRow.classList.add('highlight-new');
                    // Remove highlight after animation
                    setTimeout(() => {
                        lastRow.classList.remove('highlight-new');
                    }, 2000);
                }
                // Refresh search results to show updated tick marks
                const searchTerm = searchInput.value.toLowerCase();
                const filteredResults = clauseData
                    .filter(item => 
                        item[0].toLowerCase().includes(searchTerm) || 
                        item[1].toLowerCase().includes(searchTerm)
                    )
                    .slice(0, 5);
                displaySearchResults(filteredResults);
            }
        }

        // Update the built table
        function updateBuiltTable() {
            if (selectedItems.length === 0) {
                builtTable.innerHTML = `
                    <div class="empty-state">
                        No clauses added to the table yet. 
                        Search and click clauses above to add them.
                    </div>
                `;
                return;
            }

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Clause</th>
                    <th>Description</th>
                    <th>Action</th>
                </tr>
            `;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            selectedItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item[0]}</td>
                    <td>${item[3]}</td>
                    <td>
                        <button onclick="removeItem(${index})">Remove</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            builtTable.innerHTML = '';
            builtTable.appendChild(table);
        }

        // Remove item from table
        window.removeItem = (index) => {
            const removedItem = selectedItems[index];
            selectedItems.splice(index, 1);
            updateBuiltTable();
            toastr.warning(`Clause ${removedItem[0]} removed from table`, 'Removed');
            // Refresh search results to update tick marks
            const searchTerm = searchInput.value.toLowerCase();
            const filteredResults = clauseData
                .filter(item => 
                    item[0].toLowerCase().includes(searchTerm) || 
                    item[1].toLowerCase().includes(searchTerm)
                )
                .slice(0, 5);
            displaySearchResults(filteredResults);
        };

        // Update the copy button event listener
        copyButton.addEventListener('click', () => {
            const tableData = selectedItems.map(item => 
                `${item[0]}\t${item[3]}`
            ).join('\n');
            
            navigator.clipboard.writeText(tableData)
                .then(() => {
                    toastr.success('Table copied to clipboard!', 'Success');
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    toastr.error('Failed to copy table to clipboard', 'Error');
                });
        });

        // Update the clear button event listener
        clearButton.addEventListener('click', () => {
            selectedItems = [];
            updateBuiltTable();
            toastr.info('Table has been cleared', 'Cleared');
            // Refresh search results to update tick marks
            const searchTerm = searchInput.value.toLowerCase();
            const filteredResults = clauseData
                .filter(item => 
                    item[0].toLowerCase().includes(searchTerm) || 
                    item[1].toLowerCase().includes(searchTerm)
                )
                .slice(0, 5);
            displaySearchResults(filteredResults);
        });

        // Add loading state simulation
        function simulateLoading() {
            searchResults.innerHTML = `
                <div class="loading">
                    Searching...
                </div>
            `;
        }
    } catch (error) {
        searchSection.innerHTML = `
            <div class="error-state">
                <p>Unable to load planning clauses. Please try refreshing the page.</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
        console.error('Error loading data:', error);
    }
}); 