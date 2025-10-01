// Admin flag: agar admin login hai to true karo
let isAdmin = false;   // 👈 abhi false rakha hai, jab admin ho tab true karna
let invoiceCounter = 1;
let currentDiscountRow = null; // Charges removed, but keeping the declaration for minimal change

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set current date and time
    const now = new Date();
    document.getElementById('invoice-date').value = now.toISOString().split('T')[0];
    document.getElementById('invoice-time').value = now.toTimeString().split(' ')[0].substring(0, 5);
    
    // Set default description and terms
    document.getElementById('description').value = "22k Returning 91.6% according to 22k rate\n18k Returning 75% according to 18k rate";
    document.getElementById('terms').value = "Thank you for doing business with us.";

    // Initial total calculation
    calculateTotals();
});

function addItem() {
    const tbody = document.querySelector('#items-table tbody');
    // Using the simplified structure for cloning
    const originalRow = tbody.rows[0];
    const newRow = originalRow ? originalRow.cloneNode(true) : document.createElement('tr');
    
    // Agar koi row nahi hai to naya structure add karein
    if (tbody.rows.length === 0) {
        newRow.innerHTML = `
            <td><input type="text" placeholder="Item" onchange="calculateRow(this)"></td>
            <td><input type="number" value="1" min="1" onchange="calculateRow(this)"></td>
            <td>
                <select onchange="calculateRow(this)">
                    <option value="Piece">Piece</option>
                    <option value="Pair">Pair</option>
                    <option value="Set">Set</option>
                </select>
            </td>
            <td>
                <div class="weight-group">
                    <input type="number" step="0.01" placeholder="0.00" onchange="calculateRow(this)">
                    <select onchange="calculateRow(this)">
                        <option value="gm">gm</option>
                        <option value="mg">mg</option>
                    </select>
                </div>
            </td>
            <td><input type="number" step="0.01" placeholder="0.00" class="amount-input" onchange="calculateRow(this)"></td>
            <td class="action-column"><button class="remove-btn" onclick="removeItem(this)">Remove</button></td>
        `;
    }

    // Clear values
    const inputs = newRow.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'text') {
            input.value = '';
        } else if (input.type === 'number') {
            if (input.classList.contains('amount-input')) {
                input.value = ''; // Amount input clear
            } else if (input.min === '1') {
                input.value = '1'; // Qty input
            } else {
                input.value = ''; // Weight input
            }
        }
    });
    
    // Set default for weight unit
    const weightSelect = newRow.querySelector('.weight-group select');
    if (weightSelect) {
        weightSelect.value = 'gm';
    }

    tbody.appendChild(newRow);
    calculateTotals(); // New row added, recalculate totals
}

function removeItem(btn) {
    const tbody = document.querySelector('#items-table tbody');
    if (tbody.rows.length > 1) {
        btn.closest('tr').remove();
        calculateTotals();
    }
}

// toggleCharge() function removed as charges are removed

function calculateRow(element) {
    // Row calculation logic removed as per request, just recalculate totals
    calculateTotals();
}

// applyCommonCharges() function removed as charges are removed

function calculateTotals() {
    const rows = document.querySelectorAll('#items-table tbody tr');
    let subtotal = 0;
    
    rows.forEach(row => {
        // Amount input box se value leni hai
        const amountInput = row.querySelector('.amount-input');
        const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
        subtotal += amount;
    });
    
    // 1. GST Calculation
    const gstPercent = parseFloat(document.getElementById("gst").value) || 0;
    const totalGST = subtotal * (gstPercent / 100);
    
    // 2. Totals Calculation
    const grossTotal = subtotal + totalGST;
    const roundOff = Math.round(grossTotal) - grossTotal; 
    const total = grossTotal + roundOff; // Final total
    
    // 3. Update DOM
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('total-gst').textContent = totalGST.toFixed(2); // New GST span
    document.getElementById('round-off').textContent = roundOff.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
    
    // 4. Update amount in words
    document.getElementById('amount-words').textContent = numberToWords(Math.round(total)) + ' Rupees Only';
    
    calculateBalance();
}

function calculateBalance() {
    const total = parseFloat(document.getElementById('total').textContent) || 0;
    const received = parseFloat(document.getElementById('received').value) || 0;
    const balance = total - received;
    document.getElementById('balance').textContent = balance.toFixed(2);
}

function numberToWords(num) {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function convertHundreds(n) {
        let result = '';
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n >= 10) {
            result += teens[n - 10] + ' ';
        } else if (n > 0) {
            result += ones[n] + ' ';
        }
        return result;
    }
    
    let result = '';
    // Indian Numbering System
    if (num >= 10000000) {
        result += convertHundreds(Math.floor(num / 10000000)) + 'Crore ';
        num %= 10000000;
    }
    if (num >= 100000) {
        result += convertHundreds(Math.floor(num / 100000)) + 'Lakh ';
        num %= 100000;
    }
    if (num >= 1000) {
        result += convertHundreds(Math.floor(num / 1000)) + 'Thousand ';
        num %= 1000;
    }
    result += convertHundreds(num);
    
    return result.trim();
}

// selectDiscountType() function removed as discount is removed

function generateInvoice() {
    const newInvoiceNo = `25-26-${String(invoiceCounter).padStart(2, '0')}`;
    document.getElementById('invoice-no').value = newInvoiceNo;
    invoiceCounter++;
    
    // Update date and time
    const now = new Date();
    document.getElementById('invoice-date').value = now.toISOString().split('T')[0];
    document.getElementById('invoice-time').value = now.toTimeString().split(' ')[0].substring(0, 5);
    
    alert('Invoice generated successfully!');
}

function printInvoice() {
    // Hide action buttons for printing
    const actions = document.querySelector('.actions');
    actions.style.display = 'none';
    
    // Agar admin nahi hai to Action column hide kar do
    const actionCols = document.querySelectorAll('.items-table th.action-column, .items-table td.action-column');
    const originalActionDisplay = [];
    if (!isAdmin) {
        actionCols.forEach(col => {
            originalActionDisplay.push(col.style.display); // Store original display
            col.style.display = 'none';
        });
    }

    window.print();
    
    // Show action buttons and Action columns after printing
    setTimeout(() => {
        actions.style.display = 'flex';
        if (!isAdmin) {
            actionCols.forEach((col, index) => {
                col.style.display = originalActionDisplay[index]; // Restore original display
            });
        }
    }, 1000);
}

function downloadPDF() {
    const element = document.getElementById('invoice-container');
    const actions = document.querySelector('.actions');

    // Action buttons (Generate, Print, PDF, Reset) hide karna
    actions.style.display = 'none';

    // Agar admin nahi hai to Action column hide kar do
    const actionCols = document.querySelectorAll('.items-table th.action-column, .items-table td.action-column');
    const originalActionDisplay = [];
    if (!isAdmin) {
        actionCols.forEach(col => {
            originalActionDisplay.push(col.style.display); // Store original display
            col.style.display = 'none';
        });
    }

    // Ensure text wrapping for description & terms
    const description = document.getElementById('description');
    const terms = document.getElementById('terms');
    description.style.whiteSpace = 'pre-wrap';
    terms.style.whiteSpace = 'pre-wrap';

    const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `Invoice_${document.getElementById('invoice-no').value}_${document.getElementById('customer-name').value || 'Customer'}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 1.5, useCORS: true, allowTaint: true, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait', compress: true }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        // Wapas dikhana actions
        actions.style.display = 'flex';
        description.style.whiteSpace = '';
        terms.style.whiteSpace = '';

        // Agar admin nahi hai to wapas screen par Action column dikhana
        if (!isAdmin) {
            actionCols.forEach((col, index) => {
                col.style.display = originalActionDisplay[index]; // Restore original display
            });
        }
    });
}

function resetInvoice() {
    if (confirm('Are you sure you want to reset the invoice? All data will be lost.')) {
        // Reset all form fields
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-address').value = '';
        document.getElementById('customer-phone').value = '';
        document.getElementById('received').value = '';
        document.getElementById('description').value = "22k Returning 91.6% according to 22k rate\n18k Returning 75% according to 18k rate";
        document.getElementById('terms').value = "Thank you for doing business with us.";
        document.getElementById('gst').value = '0'; // Reset GST to 0%
        
        // Reset items table - simplified structure
        const tbody = document.querySelector('#items-table tbody');
        tbody.innerHTML = `
            <tr>
                <td><input type="text" placeholder="Item" onchange="calculateRow(this)"></td>
                <td><input type="number" value="1" min="1" onchange="calculateRow(this)"></td>
                <td>
                    <select onchange="calculateRow(this)">
                        <option value="Piece">Piece</option>
                        <option value="Pair">Pair</option>
                        <option value="Set">Set</option>
                    </select>
                </td>
                <td>
                    <div class="weight-group">
                        <input type="number" step="0.01" placeholder="0.00" onchange="calculateRow(this)">
                        <select onchange="calculateRow(this)">
                            <option value="gm">gm</option>
                            <option value="mg">mg</option>
                        </select>
                    </div>
                </td>
                <td><input type="number" step="0.01" placeholder="0.00" class="amount-input" onchange="calculateRow(this)"></td>
                <td class="action-column"><button class="remove-btn" onclick="removeItem(this)">Remove</button></td>
            </tr>
        `;
        
        // Reset totals
        calculateTotals();
        
        alert('Invoice reset successfully!');
    }
}

// Close modal when clicking outside - Discount Modal removed, so this is no longer strictly necessary but keeping for clean removal
window.onclick = function(event) {
    // const modal = document.getElementById('discount-modal'); // Modal removed
    // if (event.target === modal) {
    //     modal.style.display = 'none';
    // }
}
