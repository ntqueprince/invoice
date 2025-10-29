let itemCounter = 0;
let invoiceCounter = 1;

// ===================================
// == HELPER FUNCTIONS FOR FORMATTING ==
// ===================================

/**
 * ✅ REQUIREMENT: Rounds to nearest Rupee and formats as ₹0.00
 * Used for Preview & PDF.
 * Example: 1000.4 -> ₹1000.00
 * Example: 1000.6 -> ₹1001.00
 */
const roundAndFormat = (value) => {
    if (isNaN(value)) return '₹0.00';
    // Math.round() correctly handles .4 (down) and .6 (up)
    return `₹${(Math.round(value)).toFixed(2)}`;
};

/**
 * ✅ REQUIREMENT: Formats with exact decimals (no rounding) as ₹0.00
 * Used for Admin Panel.
 * Example: 1000.4 -> ₹1000.40
 * Example: 1000.6 -> ₹1000.60
 */
const formatAdminValue = (value) => {
    if (isNaN(value)) return '₹0.00';
    // .toFixed(2) provides exact decimals
    return `₹${value.toFixed(2)}`;
};


// ===================================
// == INITIALIZATION & EVENT LISTENERS ==
// ===================================

// Set bill date to today
document.getElementById('billDate').valueAsDate = new Date();

// Generate initial invoice number and update preview on load
updateInvoiceNumber();
updatePreview();

// Add first item row by default
addItem();

// ✅ Auto-update invoice preview whenever anything changes
window.addEventListener('load', function () {
    // Select all input, dropdown (select), and text boxes (textarea)
    const allFields = document.querySelectorAll('input, select, textarea');

    // When any value changes — run updatePreview()
    allFields.forEach(field => {
        field.addEventListener('input', updatePreview);  // For typing
        field.addEventListener('change', updatePreview); // For dropdowns/checkboxes/date
    });

    // Special listener for bill date to also update invoice number
    document.getElementById('billDate').addEventListener('change', function() {
        updateInvoiceNumber();
        updatePreview();
    });

    // Special listener for PAN checkbox
     document.getElementById('addPan').addEventListener('change', function() {
        document.getElementById('panNumber').style.display = this.checked ? 'block' : 'none';
        updatePreview();
    });
});


// =============================
// == CORE APP FUNCTIONS ==
// =============================

/**
 * Generates an invoice number based on the financial year and counter.
 */
function updateInvoiceNumber() {
    const dateInput = document.getElementById('billDate').value;
    if (!dateInput) return;

    const date = new Date(dateInput);
    const month = date.getMonth(); // 0 = Jan, 3 = April
    const year = date.getFullYear();

    let fy;
    if (month >= 3) { // April onwards is new financial year
        fy = `${year.toString().substr(2)}-${(year + 1).toString().substr(2)}`;
    } else { // Jan, Feb, March
        fy = `${(year - 1).toString().substr(2)}-${year.toString().substr(2)}`;
    }

    // Format: FY-COUNTER (e.g., 24-25-01)
    const invoiceNo = `${fy}-${String(invoiceCounter).padStart(2, '0')}`;
    document.getElementById('invoiceNo').value = invoiceNo;
}

/**
 * Adds a new item row to the ADMIN table.
 */
function addItem() {
    itemCounter++;
    const tbody = document.getElementById('itemsBody');
    const row = tbody.insertRow();
    
    // ✅ REQUIREMENT: Column order is ..., Type, GST Amt, Amount
    row.innerHTML = `
        <td>${itemCounter}</td>
        <td><input type="text" placeholder="Item description" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Qty" min="1" value="1" oninput="updatePreview()"></td>
        <td><input type="text" placeholder="22k" value="22k" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Weight (g)" min="0" step="0.001" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Rate / 10gm" min="0" step="0.01" oninput="updatePreview()"></td>
        <td><input type="number" placeholder="Making" min="0" step="0.01" oninput="updatePreview()"></td>
        <td>
            <select onchange="updatePreview()">
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
            </select>
        </td>
        <td>₹0.00</td> 
        <td>₹0.00</td>
    `;
    updatePreview(); // Update totals when new row is added
}

/**
 * Clears all item rows from the ADMIN table.
 */
function clearItems() {
    // Use a custom modal/confirm dialog if you replace this
    // window.confirm is used here as a placeholder for simplicity
    if (window.confirm('Are you sure you want to clear all items? This action cannot be undone.')) {
        document.getElementById('itemsBody').innerHTML = '';
        itemCounter = 0;
        updatePreview();
    }
}

/**
 * This is the main function.
 * It reads ALL admin inputs and updates the INVOICE PREVIEW in real-time.
 */
function updatePreview() {
    
    // =================================
    // 1. UPDATE SHOP & CUSTOMER DETAILS
    // =================================

    // ✅ REQUIREMENT: Make Shop Name editable
    const shopName = document.getElementById('shopName').value || 'Shop Name';
    document.getElementById('previewMainTitle').textContent = shopName;
    document.getElementById('previewSignatureName').textContent = shopName;
    document.querySelector('.invoice-watermark').textContent = shopName;
    document.title = `${shopName} — Invoice Creator`; // MODIFIED: Removed emojis
    
    // This is just a label, keep it static
    document.getElementById('previewShopName').textContent = '🏪 Shop Details';

    // Update Shop Info
    document.getElementById('previewAddress').innerHTML = (document.getElementById('shopAddress').value || '-').replace(/\n/g, '<br>');
    document.getElementById('previewGstin').textContent = document.getElementById('gstin').value || '-';
    document.getElementById('previewShopPhone').textContent = document.getElementById('shopPhone').value || '-';
    
    // Update Invoice Meta
    document.getElementById('previewInvoiceNo').textContent = document.getElementById('invoiceNo').value || '-';
    const dateVal = document.getElementById('billDate').value;
    if (dateVal) {
        const d = new Date(dateVal);
        document.getElementById('previewDate').textContent = d.toLocaleString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    // Update Customer Details
    document.getElementById('previewCustomerName').textContent = document.getElementById('customerName').value || '-';
    document.getElementById('previewCustomerPhone').textContent = document.getElementById('customerPhone').value || '-';
    document.getElementById('previewCustomerAddress').textContent = document.getElementById('customerAddress').value || '-';

    // Handle PAN Display
    const addPan = document.getElementById('addPan').checked;
    if (addPan) {
        document.getElementById('previewPanRow').style.display = 'block';
        document.getElementById('previewPan').textContent = document.getElementById('panNumber').value || '-';
    } else {
        document.getElementById('previewPanRow').style.display = 'none';
    }

    // Handle Notes
    const notes = document.getElementById('notes').value;
    if (notes.trim()) {
        document.getElementById('extraNotes').style.display = 'block';
        document.getElementById('previewNotes').textContent = notes;
    } else {
        document.getElementById('extraNotes').style.display = 'none';
    }

    // ✅ MODIFIED: Handle Terms & Conditions Display with class toggle
    const showTerms = document.getElementById('showTerms').checked;
    const termsSection = document.querySelector('.invoice-preview .terms');
    
    if (showTerms) {
        termsSection.classList.remove('terms-hidden');
    } else {
        termsSection.classList.add('terms-hidden');
    }

    // =================================
    // 2. PROCESS INVOICE ITEMS
    // =================================

    const itemsBody = document.getElementById('itemsBody');
    const previewBody = document.getElementById('previewItemsBody');
    previewBody.innerHTML = ''; // Clear preview table

    // Get global settings
    const gstPercent = parseFloat(document.getElementById('gstPercent').value) || 0;
    
    // ✅ UPDATED: Show exact decimal percentage (e.g., 1.5)
    const cgstPercent = gstPercent / 2;
    const sgstPercent = gstPercent / 2;
    document.getElementById('previewCgst').textContent = cgstPercent;
    document.getElementById('previewSgst').textContent = sgstPercent;

    const makingType = document.getElementById('makingType').value;
    const applySilverGst = document.getElementById('applySilverGst')?.checked || false;

    // Initialize totals (using exact, un-rounded values for calculation)
    let subtotal_preGst = 0;
    let totalGstAmount = 0;

    if (itemsBody.rows.length === 0) {
        // Show "No items" message
        previewBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #999; padding: 40px;">No items added yet. Add items above to see them here.</td></tr>';
    } else {
        // Loop through each row in the ADMIN table
        for (let i = 0; i < itemsBody.rows.length; i++) {
            const row = itemsBody.rows[i];
            const cells = row.cells;
            
            // Read all values from admin inputs
            const num = cells[0].textContent;
            const desc = cells[1].querySelector('input').value;
            const qty = parseFloat(cells[2].querySelector('input').value) || 0;
            const purity = cells[3].querySelector('input').value;
            const netWt = parseFloat(cells[4].querySelector('input').value) || 0;
            const rate = parseFloat(cells[5].querySelector('input').value) || 0;
            const makingInput = parseFloat(cells[6].querySelector('input').value) || 0;
            const itemType = cells[7].querySelector('select').value;

            // --- Calculate item values (exact) ---
            const goldAmount = (rate / 10) * netWt;
            
            let making = 0;
            if (makingType === 'percent') {
                making = (goldAmount * makingInput) / 100;
            } else {
                making = makingInput;
            }

            const itemSubtotal_preGst = (goldAmount + making) * qty;
            
            let itemGstAmount = 0;
            // Apply GST only to gold, or to silver if checkbox is checked
            if (itemType === 'gold' || (itemType === 'silver' && applySilverGst)) {
                itemGstAmount = (itemSubtotal_preGst * gstPercent) / 100;
            }
            
            const itemTotalAmount_with_Gst = itemSubtotal_preGst + itemGstAmount;

            // --- Update ADMIN table (Exact Values) ---
            // ✅ REQUIREMENT: Use exact decimals, new column order
            cells[8].textContent = formatAdminValue(itemGstAmount);      // Col 8 = GST Amt
            cells[9].textContent = formatAdminValue(itemTotalAmount_with_Gst); // Col 9 = Amount

            // Add exact values to totals
            subtotal_preGst += itemSubtotal_preGst;
            totalGstAmount += itemGstAmount;
            
            const makingDisplay = makingType === 'percent' ? `${makingInput}%` : `₹${makingInput.toFixed(2)}`;

            // --- Add row to PREVIEW table (Rounded Values) ---
            // ✅ REQUIREMENT: Use rounded values, new column order
            const previewRow = previewBody.insertRow();
            previewRow.innerHTML = `
                <td>${num}</td>
                <td>${desc || '-'}</td>
                <td>${qty}</td>
                <td>${purity || '-'}</td>
                <td>${netWt.toFixed(3)}</td> <td>₹${rate.toFixed(2)}</td>
                <td>${makingDisplay}</td>
                <td>${roundAndFormat(itemGstAmount)}</td>
                <td>${roundAndFormat(itemTotalAmount_with_Gst)}</td>
            `;
        }
    }

    // =================================
    // 3. CALCULATE AND DISPLAY TOTALS
    // =================================

    const cgstAmount = totalGstAmount / 2;
    const sgstAmount = totalGstAmount / 2;
    const subtotalWithGST = subtotal_preGst + totalGstAmount;
    
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
        // ✅ REQUIREMENT: Use rounded value for discount display
        document.getElementById('previewDiscount').textContent = `-${roundAndFormat(discountAmount)}`;
    } else {
        document.getElementById('discountRow').style.display = 'none';
    }

    const grandTotal = subtotalWithGST - discountAmount;

    // ✅ REQUIREMENT: Update all preview totals using roundAndFormat
    document.getElementById('previewSubtotal').textContent = roundAndFormat(subtotal_preGst);
    document.getElementById('previewCgstAmount').textContent = roundAndFormat(cgstAmount);
    document.getElementById('previewSgstAmount').textContent = roundAndFormat(sgstAmount);
    document.getElementById('previewGrandTotal').textContent = roundAndFormat(grandTotal);
}

/**
 * Generates and downloads a PDF of the invoice preview.
 */
async function downloadPDF() {
    // Use a custom modal/confirm dialog if you replace this
    if (!window.confirm('Generate PDF invoice? This will increment the invoice counter.')) {
        return;
    }
    
    const { jsPDF } = window.jspdf;
    
    // Hide all admin elements
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => el.style.display = 'none');

    const invoice = document.getElementById('invoicePreview');
    
    try {
        const canvas = await html2canvas(invoice, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            imageTimeout: 0,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG for smaller file size
        const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, mm, A4
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate ratio to fit image on page
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        const imgX = (pdfWidth - imgWidth * ratio) / 2; // Center horizontally
        const imgY = 0; // Start at top

        pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio, undefined, 'FAST');
        
        const invoiceNo = document.getElementById('invoiceNo').value || 'invoice';
        const customerName = document.getElementById('customerName').value || 'customer';
        const fileName = `Sakshi_Jewellers_Invoice_${invoiceNo}_${customerName.replace(/\s+/g, '_')}.pdf`;
        
        pdf.save(fileName);

        // Increment counter for next invoice
        invoiceCounter++;
        updateInvoiceNumber();
        updatePreview(); // Ensure preview is updated with new number

        alert('PDF generated successfully! Invoice counter has been incremented for the next invoice.');

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please check the console for details.');
    }

    // Show admin elements again
    elementsToHide.forEach(el => el.style.display = '');
}
