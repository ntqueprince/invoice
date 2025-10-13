let itemCounter = 0;
let invoiceCounter = 1;

// Initialize with current date
document.getElementById('billDate').valueAsDate = new Date();

// Generate initial invoice number
updateInvoiceNumber();
updatePreview();

// Event listeners for real-time preview updates
document.getElementById('invoiceNo').addEventListener('input', updatePreview);
document.getElementById('shopName').addEventListener('input', updatePreview);
document.getElementById('shopAddress').addEventListener('input', updatePreview);
document.getElementById('gstin').addEventListener('input', updatePreview);
document.getElementById('shopPhone').addEventListener('input', updatePreview);
document.getElementById('billDate').addEventListener('change', function() {
    updateInvoiceNumber();
    updatePreview();
});
document.getElementById('gstPercent').addEventListener('input', updatePreview);
document.getElementById('discount').addEventListener('input', updatePreview);
document.getElementById('discountType').addEventListener('change', updatePreview);
document.getElementById('makingType').addEventListener('change', updatePreview);
document.getElementById('customerName').addEventListener('input', updatePreview);
document.getElementById('customerPhone').addEventListener('input', updatePreview);
document.getElementById('customerAddress').addEventListener('input', updatePreview);
document.getElementById('notes').addEventListener('input', updatePreview);
document.getElementById('addPan').addEventListener('change', function() {
    document.getElementById('panNumber').style.display = this.checked ? 'block' : 'none';
    updatePreview();
});
document.getElementById('panNumber').addEventListener('input', updatePreview);

function updateInvoiceNumber() {
    const dateInput = document.getElementById('billDate').value;
    if (!dateInput) return;

    const date = new Date(dateInput);
    const month = date.getMonth();
    const year = date.getFullYear();

    let fy;
    if (month >= 3) { // April onwards is new financial year
        fy = `${year.toString().substr(2)}-${(year + 1).toString().substr(2)}`;
    } else {
        fy = `${(year - 1).toString().substr(2)}-${year.toString().substr(2)}`;
    }

    const invoiceNo = `${fy}-${String(invoiceCounter).padStart(2, '0')}`;
    document.getElementById('invoiceNo').value = invoiceNo;
}

function addItem() {
    itemCounter++;
    const tbody = document.getElementById('itemsBody');
    const row = tbody.insertRow();
    row.innerHTML = `
        <td>${itemCounter}</td>
        <td><input type="text" placeholder="Item description (e.g., Gold Ring, Chain, etc.)" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Qty" min="1" value="1" oninput="updatePreview()"></td>
        <td><input type="text" placeholder="22k" value="22k" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Weight in grams" min="0" step="0.01" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Rate per 10gm" min="0" step="0.01" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Making charge" min="0" step="0.01" oninput="updatePreview()"></td>
        <td>
            <select onchange="updatePreview()" style="width: 100%; padding: 8px; border: 2px solid #e8d7a0; border-radius: 6px;">
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
            </select>
        </td>
        <td style="font-weight: bold; color: #28a745;">₹0.00</td>
    `;
    updatePreview();
}

function clearItems() {
    if (confirm('Are you sure you want to clear all items? This action cannot be undone.')) {
        document.getElementById('itemsBody').innerHTML = '';
        itemCounter = 0;
        updatePreview();
    }
}

function updatePreview() {
    // Update shop information
    document.getElementById('previewShopName').textContent = '🏪 Shop Details';
    document.getElementById('previewAddress').innerHTML = (document.getElementById('shopAddress').value || '').replace(/\n/g, '<br>');
    document.getElementById('previewGstin').textContent = document.getElementById('gstin').value || '-';
    document.getElementById('previewShopPhone').textContent = document.getElementById('shopPhone').value || '8298801698';
    document.getElementById('previewInvoiceNo').textContent = document.getElementById('invoiceNo').value || '-';
    
    // Update date
    const dateVal = document.getElementById('billDate').value;
    if (dateVal) {
        const d = new Date(dateVal);
        document.getElementById('previewDate').textContent = d.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    // Update customer details
    document.getElementById('previewCustomerName').textContent = document.getElementById('customerName').value || '-';
    document.getElementById('previewCustomerPhone').textContent = document.getElementById('customerPhone').value || '-';
    document.getElementById('previewCustomerAddress').textContent = document.getElementById('customerAddress').value || '-';

    // Handle PAN display
    const addPan = document.getElementById('addPan').checked;
    if (addPan) {
        document.getElementById('previewPanRow').style.display = 'block';
        document.getElementById('previewPan').textContent = document.getElementById('panNumber').value || '-';
    } else {
        document.getElementById('previewPanRow').style.display = 'none';
    }

    // Handle notes
    const notes = document.getElementById('notes').value;
    if (notes.trim()) {
        document.getElementById('extraNotes').style.display = 'block';
        document.getElementById('previewNotes').textContent = notes;
    } else {
        document.getElementById('extraNotes').style.display = 'none';
    }

    // Process items
    const itemsBody = document.getElementById('itemsBody');
    const previewBody = document.getElementById('previewItemsBody');
    previewBody.innerHTML = '';

    let subtotal = 0;
    let totalGoldAmount = 0;
    let totalMaking = 0;

    const makingType = document.getElementById('makingType').value;

    if (itemsBody.rows.length === 0) {
        previewBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999; padding: 40px;">No items added yet. Add items above to see them here.</td></tr>';
    } else {
        for (let i = 0; i < itemsBody.rows.length; i++) {
            const row = itemsBody.rows[i];
            const cells = row.cells;
            
            const num = cells[0].textContent;
            const desc = cells[1].querySelector('input').value;
            const qty = parseFloat(cells[2].querySelector('input').value) || 0;
            const purity = cells[3].querySelector('input').value;
            const netWt = parseFloat(cells[4].querySelector('input').value) || 0;
            const rate = parseFloat(cells[5].querySelector('input').value) || 0;
            const makingInput = parseFloat(cells[6].querySelector('input').value) || 0;
            const itemType = cells[7].querySelector('select').value;

            const goldAmount = (rate / 10) * netWt;
            
            let making = 0;
            if (makingType === 'percent') {
                making = (goldAmount * makingInput) / 100;
            } else {
                making = makingInput;
            }

            const amount = goldAmount + making;
            
            // Update amount in admin table
            cells[8].textContent = `₹${amount.toFixed(2)}`;

            subtotal += amount;
            
            if (itemType === 'gold') {
                totalGoldAmount += goldAmount;
                totalMaking += making;
            }

            const makingDisplay = makingType === 'percent' ? `${makingInput}%` : `₹${makingInput}`;

            const previewRow = previewBody.insertRow();
           previewRow.innerHTML = `
    <td style="text-align: center; font-weight: bold; color: #8b6914;">${num}</td>
    <td>${desc || '-'}</td>
    <td style="text-align: center;">${qty}</td>
    <td style="text-align: center;">${purity || '-'}</td>
    <td style="text-align: center;">${netWt.toFixed(2)}</td>
    <td style="text-align: center;">₹${rate.toFixed(2)}</td>  <!-- ✅ centered -->
    <td style="text-align: center;">${makingDisplay}</td>
    <td style="text-align: right; font-weight: bold; color: #28a745;">₹${amount.toFixed(2)}</td>
`;
        }
    }

    // ✅ Apply GST on total (Gold + Making)
// Silver items ke liye optional GST system

const gstPercent = parseFloat(document.getElementById('gstPercent').value) || 3;
const cgstPercent = gstPercent / 2;
const sgstPercent = gstPercent / 2;
const applySilverGst = document.getElementById('applySilverGst')?.checked || false;

// Alag totals for gold and silver
let goldSubtotal = 0;
let silverSubtotal = 0;

// Calculate totals by type
// NOTE: don't re-declare itemsBody if it's already declared earlier in this function
for (let i = 0; i < itemsBody.rows.length; i++) {
    const row = itemsBody.rows[i];
    const itemType = row.cells[7].querySelector('select').value;
    // remove currency symbol and commas robustly
    const amountText = (row.cells[8].textContent || '').replace(/[^\d.\-]/g, '');
    const amount = parseFloat(amountText) || 0;

    if (itemType === 'gold') goldSubtotal += amount;
    if (itemType === 'silver') silverSubtotal += amount;
}

// ✅ GST calculation — silver par GST optional hai
// Gold par hamesha GST lagega

// Silver par GST sirf tab lagega jab checkbox checked ho
let taxableSubtotal = goldSubtotal + (applySilverGst ? silverSubtotal : 0);

// GST only on taxable subtotal (gold + optionally silver)
const cgstAmount = (taxableSubtotal * cgstPercent) / 100;
const sgstAmount = (taxableSubtotal * sgstPercent) / 100;

// 🟡 Agar checkbox unchecked hai, to silver ke amount par GST nahi lagega
// par silver amount total me include rahega
const nonTaxableSilver = applySilverGst ? 0 : silverSubtotal;

// ✅ Final total (gold + silver + applicable GST)
// ✅ Safe total calculation (works even if GST = 0 or not applied)
let subtotalWithGST;

if (isNaN(cgstAmount) || isNaN(sgstAmount) || gstPercent === 0) {
    // Agar GST disable hai, to sirf subtotal hi total hoga
    subtotalWithGST = subtotal;
    cgstAmount = 0;
    sgstAmount = 0;
} else {
    subtotalWithGST = taxableSubtotal + nonTaxableSilver + cgstAmount + sgstAmount;
}


    // Apply discount AFTER GST
    const discountValue = parseFloat(document.getElementById('discount').value) || 0;
    const discountType = document.getElementById('discountType').value;
    let discountAmount = 0;
    
    if (discountValue > 0) {
        if (discountType === 'percent') {
            discountAmount = (subtotalWithGST * discountValue) / 100;
            document.getElementById('previewDiscountLabel').textContent = `${discountValue}%`;
        } else {
            discountAmount = discountValue;
            document.getElementById('previewDiscountLabel').textContent = `₹${discountValue}`;
        }
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('previewDiscount').textContent = `₹${discountAmount.toFixed(2)}`;
    } else {
        document.getElementById('discountRow').style.display = 'none';
    }

    // Update totals
    document.getElementById('previewCgst').textContent = cgstPercent.toFixed(2);
    document.getElementById('previewSgst').textContent = sgstPercent.toFixed(2);
    
    document.getElementById('previewSubtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('previewCgstAmount').textContent = `₹${cgstAmount.toFixed(2)}`;
    document.getElementById('previewSgstAmount').textContent = `₹${sgstAmount.toFixed(2)}`;

    const grandTotal = subtotalWithGST - discountAmount;
    document.getElementById('previewGrandTotal').textContent = `₹${grandTotal.toFixed(2)}`;
}

async function downloadPDF() {
    if (confirm('Generate PDF invoice? This will increment the invoice counter.')) {
        const { jsPDF } = window.jspdf;
        
        // Hide admin sections
        document.querySelector('h1').style.display = 'none';
        document.querySelector('.admin-panel').style.display = 'none';
        document.querySelector('.items-section').style.display = 'none';
        document.querySelector('.download-section').style.display = 'none';

        const invoice = document.getElementById('invoicePreview');
        
        try {
            const canvas = await html2canvas(invoice, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                imageTimeout: 0,
                removeContainer: true,
                width: invoice.scrollWidth,
                height: invoice.scrollHeight
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 5;

            pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio, undefined, 'FAST');
            
            const invoiceNo = document.getElementById('invoiceNo').value || 'invoice';
            const customerName = document.getElementById('customerName').value || 'customer';
            const fileName = `Sakshi_Jewellers_Invoice_${invoiceNo}_${customerName.replace(/\s+/g, '_')}.pdf`;
            
            pdf.save(fileName);

            // Increment counter for next invoice
            invoiceCounter++;
            updateInvoiceNumber();

            alert('PDF generated successfully! Invoice counter has been incremented for the next invoice.');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again or check your browser settings.');
        }

        // Show admin sections again
        document.querySelector('h1').style.display = 'block';
        document.querySelector('.admin-panel').style.display = 'block';
        document.querySelector('.items-section').style.display = 'block';
        document.querySelector('.download-section').style.display = 'block';
    }
}

// Add first item by default
addItem();
// ✅ Auto-update invoice preview whenever anything changes
window.addEventListener('load', function () {
    // Select all input, dropdown (select), and text boxes (textarea)
    const allFields = document.querySelectorAll('input, select, textarea');

    // Jab bhi koi value badlegi — updatePreview() function chalega
    allFields.forEach(field => {
        field.addEventListener('input', updatePreview);  // Type karne par chalega
        field.addEventListener('change', updatePreview); // Dropdown/checkbox par chalega
    });
});
