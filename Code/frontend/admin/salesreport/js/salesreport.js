class DateRangeHelper {
    static formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    static getDateRange(rangeType) {
        const now = new Date();
        let start, end;

        switch (rangeType) {
            case 'daily':
                start = new Date(now);
                end = new Date(now);
                break;
            case 'weekly':
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
                start = null;
                end = null;
        }

        return {
            start: start ? this.formatDate(start) : '',
            end: end ? this.formatDate(end) : ''
        };
    }
}
class MoneyFormatter {
    static format(value) {
        if (isNaN(value)) return "₱0.00";
        return "₱" + Number(value).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}


class SalesReportService {
    constructor(apiBasePath) {
        this.apiBasePath = apiBasePath;
    }

    async loadReport(start, end) {
        let url = `${this.apiBasePath}/salesreport`;
        if (start && end) {
            url += `?start=${start}&end=${end}`;
        }

        try {
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error(err);
            return { status: false, message: err.message };
        }
    }
}

class SalesReportController {
    constructor(apiBasePath) {
        this.service = new SalesReportService(apiBasePath);
        this.startDateEl = document.getElementById('startDate');
        this.endDateEl = document.getElementById('endDate');
        this.totalSalesEl = document.getElementById('totalSales');
        this.totalOrdersEl = document.getElementById('totalOrders');
        this.topSellingTableEl = document.getElementById('topSellingTable');
        this.loadReportBtn = document.getElementById('loadReport');
        this.rangeButtons = document.querySelectorAll('button[data-range]');
    }

    init() {
        this.bindEvents();
        this.resetDateInputs();
        this.fetchAndRender();
    }

    bindEvents() {
        this.loadReportBtn.addEventListener('click', () => {
            const start = this.startDateEl.value;
            const end = this.endDateEl.value;
            this.fetchAndRender(start, end);
        });

        this.rangeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const range = btn.getAttribute('data-range');
                const { start, end } = DateRangeHelper.getDateRange(range);
                this.startDateEl.value = start;
                this.endDateEl.value = end;
                this.fetchAndRender(start, end);
            });
        });
    }

    resetDateInputs() {
        this.startDateEl.value = '';
        this.endDateEl.value = '';
    }

    async fetchAndRender(start = '', end = '') {
        const data = await this.service.loadReport(start, end);

        if (!data.status) {
            alert(data.message || "Failed to load sales report");
            return;
        }

        this.totalSalesEl.textContent = MoneyFormatter.format(data.total_sales);

        this.totalOrdersEl.textContent = data.total_orders;
        this.renderTopSelling(data.top_selling);
    }

    renderTopSelling(items) {
    this.topSellingTableEl.innerHTML = "";
    items.forEach(item => {
        const revenue = item.total_revenue ? MoneyFormatter.format(item.total_revenue) : "₱0.00";
        const row = `
            <tr>
                <td>${item.name}</td>
                <td>${item.total_sold}</td>
                <td>${revenue}</td>
            </tr>`;
        this.topSellingTableEl.innerHTML += row;
    });
}

}

// ===== Initialization =====
window.addEventListener('DOMContentLoaded', () => {
    const controller = new SalesReportController(API_BASE_PATH);
    controller.init();
});
