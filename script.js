let itemCounter = 0;
let invoiceCounter = 1;

document.getElementById('billDate').valueAsDate = new Date();

updateInvoiceNumber();
updatePreview();

// Event Listeners for all input fields to trigger preview updates
document.getElementById('shopName').addEventListener('input', updatePreview);
document.getElementById('shopAddress').addEventListener('input', updatePreview);
document.getElementById('gstin').addEventListener('input', updatePreview);
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
document.getElementById('addPan').addEventListener('change', function() {
    document.getElementById('panNumber').style.display = this.checked ? 'block' : 'none';
    updatePreview();
});
document.getElementById('panNumber').addEventListener('input', updatePreview);
document.getElementById('invoiceNo').addEventListener('input', updatePreview); // Added for manual input handling

function updateInvoiceNumber() {
    const dateInput = document.getElementById('billDate').value;
    if (!dateInput) return;

    const date = new Date(dateInput);
    const month = date.getMonth();
    const year = date.getFullYear();

    let fy; // Fiscal Year
    if (month >= 3) { // April (3) to December (11)
        fy = `${year.toString().substr(2)}-${(year + 1).toString().substr(2)}`;
    } else { // January (0) to March (2)
        fy = `${(year - 1).toString().substr(2)}-${year.toString().substr(2)}`;
    }

    const invoiceNo = `${fy}-${String(invoiceCounter).padStart(4, '0')}`; // Changed to 4 digits padding for better scaling
    document.getElementById('invoiceNo').value = invoiceNo;
}

function addItem() {
    itemCounter++;
    const tbody = document.getElementById('itemsBody');
    const row = tbody.insertRow();
    row.innerHTML = `
        <td>${itemCounter}</td>
        <td><input type="text" placeholder="Item description" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Qty" min="1" value="1" oninput="updatePreview()"></td>
        <td><input type="text" placeholder="22k" value="22k" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Weight" min="0" step="0.01" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Rate" min="0" step="0.01" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Making" min="0" step="0.01" oninput="updatePreview()"></td>
        <td>
            <select onchange="updatePreview()" style="width: 100%; padding: 6px; border: 1px solid #e8d7a0; border-radius: 4px;">
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
            </select>
        </td>
        <td>₹0.00</td>
    `;
    updatePreview();
}

function clearItems() {
    document.getElementById('itemsBody').innerHTML = '';
    itemCounter = 0;
    updatePreview();
}

function updatePreview() {
    // 1. Update Shop & Meta Details
    document.getElementById('previewShopName').textContent = document.getElementById('shopName').value || 'Sakshi Jewellers';
    document.getElementById('previewAddress').innerHTML = (document.getElementById('shopAddress').value || '').replace(/\n/g, '<br>');
    document.getElementById('previewGstin').textContent = document.getElementById('gstin').value || '-';
    document.getElementById('previewInvoiceNo').textContent = document.getElementById('invoiceNo').value || '-';
    
    const dateVal = document.getElementById('billDate').value;
    if (dateVal) {
        const d = new Date(dateVal);
        document.getElementById('previewDate').textContent = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } else {
        document.getElementById('previewDate').textContent = '-';
    }

    // 2. Update Customer Details
    document.getElementById('previewCustomerName').textContent = document.getElementById('customerName').value || '-';
    document.getElementById('previewCustomerPhone').textContent = document.getElementById('customerPhone').value || '-';
    document.getElementById('previewCustomerAddress').textContent = document.getElementById('customerAddress').value || '-';

    const addPan = document.getElementById('addPan').checked;
    if (addPan) {
        document.getElementById('previewPanRow').style.display = 'block';
        document.getElementById('previewPan').textContent = document.getElementById('panNumber').value || '-';
    } else {
        document.getElementById('previewPanRow').style.display = 'none';
    }

    // 3. Process Items and Calculate Totals
    const itemsBody = document.getElementById('itemsBody');
    const previewBody = document.getElementById('previewItemsBody');
    previewBody.innerHTML = '';

    let subtotal = 0;
    let totalGoldAmount = 0;
    const makingType = document.getElementById('makingType').value;

    if (itemsBody.rows.length === 0) {
        previewBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No items added</td></tr>';
    } else {
        for (let i = 0; i < itemsBody.rows.length; i++) {
            const row = itemsBody.rows[i];
            const cells = row.cells;
            
            // Get input values
            const num = cells[0].textContent;
            const desc = cells[1].querySelector('input').value;
            const qty = parseFloat(cells[2].querySelector('input').value) || 0;
            const purity = cells[3].querySelector('input').value;
            const netWt = parseFloat(cells[4].querySelector('input').value) || 0;
            const rate = parseFloat(cells[5].querySelector('input').value) || 0;
            const makingInput = parseFloat(cells[6].querySelector('input').value) || 0;
            const itemType = cells[7].querySelector('select').value;

            // Calculations
            const goldAmount = (rate / 10) * netWt;
            
            let making = 0;
            if (makingType === 'percent') {
                making = (goldAmount * makingInput) / 100;
            } else {
                making = makingInput;
            }

            const amount = goldAmount + making;
            
            // Update Amount cell in Admin Panel
            cells[8].textContent = `₹${amount.toFixed(2)}`;

            subtotal += amount;
            
            // Only Gold amount is used for GST calculation
            if (itemType === 'gold') {
                totalGoldAmount += goldAmount;
            }

            const makingDisplay = makingType === 'percent' ? `${makingInput}%` : `₹${makingInput.toFixed(2)}`;

            // Create Preview Row
            const previewRow = previewBody.insertRow();
            previewRow.innerHTML = `
                <td>${num}</td>
                <td>${desc || '-'}</td>
                <td>${qty}</td>
                <td>${purity || '-'}</td>
                <td>${netWt.toFixed(2)}</td>
                <td>₹${rate.toFixed(2)}</td>
                <td>${makingDisplay}</td>
                <td>₹${amount.toFixed(2)}</td>
            `;
        }
    }

    // 4. Calculate Taxes (GST on Total Gold Amount)
    const gstPercent = parseFloat(document.getElementById('gstPercent').value) || 3;
    const cgstPercent = gstPercent / 2;
    const sgstPercent = gstPercent / 2;

    const cgstAmount = (totalGoldAmount * cgstPercent) / 100;
    const sgstAmount = (totalGoldAmount * sgstPercent) / 100;

    const subtotalWithGST = subtotal + cgstAmount + sgstAmount;

    // 5. Calculate Discount (After GST)
    const discountValue = parseFloat(document.getElementById('discount').value) || 0;
    const discountType = document.getElementById('discountType').value;
    let discountAmount = 0;
    
    if (discountValue > 0) {
        if (discountType === 'percent') {
            discountAmount = (subtotalWithGST * discountValue) / 100;
            document.getElementById('previewDiscountLabel').textContent = `${discountValue}%`;
        } else {
            discountAmount = discountValue;
            document.getElementById('previewDiscountLabel').textContent = `₹${discountValue.toFixed(2)}`;
        }
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('previewDiscount').textContent = `₹${discountAmount.toFixed(2)}`;
    } else {
        document.getElementById('discountRow').style.display = 'none';
    }

    // 6. Update Totals in Preview
    document.getElementById('previewCgst').textContent = cgstPercent.toFixed(2);
    document.getElementById('previewSgst').textContent = sgstPercent.toFixed(2);
    
    document.getElementById('previewSubtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('previewCgstAmount').textContent = `₹${cgstAmount.toFixed(2)}`;
    document.getElementById('previewSgstAmount').textContent = `₹${sgstAmount.toFixed(2)}`;

    const grandTotal = subtotalWithGST - discountAmount;
    document.getElementById('previewGrandTotal').textContent = `₹${grandTotal.toFixed(2)}`;
}

// 7. PDF Download Function
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    
    // Hide Admin elements before capturing
    document.querySelector('h1').style.display = 'none';
    document.querySelector('.admin-panel').style.display = 'none';
    document.querySelector('.items-section').style.display = 'none';
    document.querySelector('.download-section').style.display = 'none';

    const invoice = document.getElementById('invoicePreview');
    
    try {
        const canvas = await html2canvas(invoice, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            imageTimeout: 0,
            removeContainer: true
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate the ratio to fit image height-wise on the PDF page
        const imgRatio = imgWidth / imgHeight;
        let pdfImgWidth = pdfWidth - 10; // 5mm margin on each side
        let pdfImgHeight = pdfImgWidth / imgRatio;

        // If the resulting height is too tall, adjust based on height
        if (pdfImgHeight > pdfHeight - 10) {
            pdfImgHeight = pdfHeight - 10;
            pdfImgWidth = pdfImgHeight * imgRatio;
        }

        const imgX = (pdfWidth - pdfImgWidth) / 2;
        const imgY = (pdfHeight - pdfImgHeight) / 2;
        
        pdf.addImage(imgData, 'JPEG', imgX, imgY, pdfImgWidth, pdfImgHeight, undefined, 'MEDIUM');
        
        const invoiceNo = document.getElementById('invoiceNo').value || 'invoice';
        pdf.save(`invoice_${invoiceNo}.pdf`);

        // Increment and update invoice number for the next bill
        invoiceCounter++;
        updateInvoiceNumber();

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }

    // Restore Admin elements after download
    document.querySelector('h1').style.display = 'block';
    document.querySelector('.admin-panel').style.display = 'block';
    document.querySelector('.items-section').style.display = 'block';
    document.querySelector('.download-section').style.display = 'block';
}

// Initial Call
addItem();
