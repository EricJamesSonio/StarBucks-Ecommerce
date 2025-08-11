function formatDate(date) {
    // Returns YYYY-MM-DD string
    return date.toISOString().split('T')[0];
}

function getDateRange(rangeType) {
    const now = new Date();
    let start, end;

    switch(rangeType) {
        case 'daily':
            start = new Date(now);
            end = new Date(now);
            break;
        case 'weekly':
            // week starts on Sunday (0)
            start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            break;
        case 'monthly':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'yearly':
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
            break;
        default:
            // For "all time", return nulls to fetch all data
            start = null;
            end = null;
    }

    return {
        start: start ? formatDate(start) : '',
        end: end ? formatDate(end) : ''
    };
}

function loadReport(start, end) {
    let url = `${API_BASE_PATH}/salesreport`;
    if (start && end) {
        url += `?start=${start}&end=${end}`;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.status) {
                alert(data.message || "Failed to load sales report");
                return;
            }

            document.getElementById('totalSales').textContent = `₱${parseFloat(data.total_sales).toFixed(2)}`;

            document.getElementById('totalOrders').textContent = data.total_orders;

            const tbody = document.getElementById('topSellingTable');
            tbody.innerHTML = "";
            data.top_selling.forEach(item => {
                const row = `<tr><td>${item.name}</td><td>${item.total_sold}</td></tr>`;
                tbody.innerHTML += row;
            });
        })
        .catch(err => console.error(err));
}

// On clicking Load Report button
document.getElementById('loadReport').addEventListener('click', () => {
    const start = document.getElementById('startDate').value;
    const end   = document.getElementById('endDate').value;
    loadReport(start, end);
});

// On clicking quick range buttons
document.querySelectorAll('button[data-range]').forEach(btn => {
    btn.addEventListener('click', () => {
        const range = btn.getAttribute('data-range');
        const { start, end } = getDateRange(range);

        document.getElementById('startDate').value = start;
        document.getElementById('endDate').value = end;
        loadReport(start, end);
    });
});

// On page load: show full report or default range (e.g., yearly)
window.addEventListener('DOMContentLoaded', () => {
    // Default: no dates = full report OR pick yearly:
    // const { start, end } = getDateRange('yearly');
    // document.getElementById('startDate').value = start;
    // document.getElementById('endDate').value = end;
    // loadReport(start, end);

    // Or load full report with no date filter
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    loadReport();
});
