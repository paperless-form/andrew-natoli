// Sample data structure (simulating Google Sheets data)
const sheetData = [
    { id: 1, name: "MacBook Pro 16\"", category: "Laptops", price: "$2,399" },
    { id: 2, name: "iPhone 13 Pro", category: "Smartphones", price: "$999" },
    { id: 3, name: "iPad Air", category: "Tablets", price: "$599" },
    { id: 4, name: "AirPods Pro", category: "Audio", price: "$249" },
    { id: 5, name: "Apple Watch Series 7", category: "Wearables", price: "$399" },
    { id: 6, name: "Dell XPS 15", category: "Laptops", price: "$1,799" },
    { id: 7, name: "Samsung Galaxy S22", category: "Smartphones", price: "$799" },
    { id: 8, name: "Sony WH-1000XM4", category: "Audio", price: "$349" },
    { id: 9, name: "Microsoft Surface Pro", category: "Tablets", price: "$999" },
    { id: 10, name: "Fitbit Versa 3", category: "Wearables", price: "$229" }
];

let selectedItems = [];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const builtTable = document.getElementById('builtTable');
    const copyButton = document.getElementById('copyButton');
    const clearButton = document.getElementById('clearButton');

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        simulateLoading();
        
        // Simulate network delay
        setTimeout(() => {
            const filteredResults = sheetData
                .filter(item => 
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.category.toLowerCase().includes(searchTerm)
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
                    No matching items found
                </div>
            `;
            return;
        }

        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="item-info">
                    <strong>${item.name}</strong>
                    <span class="category">${item.category}</span>
                </div>
                <div class="item-price">${item.price}</div>
            `;
            resultItem.addEventListener('click', () => addToTable(item));
            searchResults.appendChild(resultItem);
        });
    }

    // Add item to table
    function addToTable(item) {
        if (!selectedItems.find(selected => selected.id === item.id)) {
            selectedItems.push(item);
            updateBuiltTable();
        }
    }

    // Update the built table
    function updateBuiltTable() {
        if (selectedItems.length === 0) {
            builtTable.innerHTML = `
                <div class="empty-state">
                    No items added to the table yet. 
                    Search and click items above to add them.
                </div>
            `;
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Action</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        selectedItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.price}</td>
                <td>
                    <button onclick="removeItem(${item.id})">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        builtTable.innerHTML = '';
        builtTable.appendChild(table);
    }

    // Remove item from table
    window.removeItem = (itemId) => {
        selectedItems = selectedItems.filter(item => item.id !== itemId);
        updateBuiltTable();
    };

    // Copy table to clipboard
    copyButton.addEventListener('click', () => {
        const tableData = selectedItems.map(item => 
            `${item.name}\t${item.category}\t${item.price}`
        ).join('\n');
        
        navigator.clipboard.writeText(tableData)
            .then(() => alert('Table copied to clipboard!'))
            .catch(err => console.error('Failed to copy: ', err));
    });

    // Clear table
    clearButton.addEventListener('click', () => {
        selectedItems = [];
        updateBuiltTable();
    });

    // Add loading state simulation
    function simulateLoading() {
        searchResults.innerHTML = `
            <div class="loading">
                Searching...
            </div>
        `;
    }
}); 