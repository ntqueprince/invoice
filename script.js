let itemCounter = 0;
let currentDiscountRow = null;

// ==============================
// Initialize
// ==============================
document.addEventListener("DOMContentLoaded", function () {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().split(" ")[0].substring(0, 5);

  document.getElementById("invoiceDate").value = today;
  document.getElementById("invoiceTime").value = currentTime;

  generateWatermark();
  addItem();
});

// ==============================
// Watermark
// ==============================
function generateWatermark() {
  const watermark = document.getElementById("watermark");
  const text = "Sakshi Jewellers";
  const positions = [
    { top: "10%", left: "10%" },
    { top: "10%", left: "60%" },
    { top: "30%", left: "35%" },
    { top: "50%", left: "10%" },
    { top: "50%", left: "60%" },
    { top: "70%", left: "35%" },
    { top: "90%", left: "10%" },
    { top: "90%", left: "60%" },
  ];

  positions.forEach((pos) => {
    const span = document.createElement("span");
    span.className = "watermark-text";
    span.textContent = text;
    span.style.top = pos.top;
    span.style.left = pos.left;
    watermark.appendChild(span);
  });
}

// ==============================
// Add Item Row
// ==============================
function addItem() {
  itemCounter++;
  const tbody = document.getElementById("itemsBody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" class="item-input item-name" placeholder="Item"></td>
    <td><input type="number" class="item-input item-qty" min="0" step="1" value="1" oninput="calculateRowTotal(this)"></td>
    <td>
      <select class="item-input item-unit">
        <option value="piece">Piece</option>
        <option value="pair">Pair</option>
        <option value="set">Set</option>
      </select>
    </td>
    <td>
      <div style="display:flex;gap:5px;">
        <input type="number" class="item-input item-weight" min="0" step="0.01" placeholder="0" oninput="calculateRowTotal(this)">
        <select class="item-input item-weight-unit" onchange="calculateRowTotal(this)">
          <option value="gm">gm</option>
          <option value="mg">mg</option>
        </select>
      </div>
    </td>
<td><input type="number" class="item-input item-price" min="0" step="0.01" placeholder="0.00"></td>
    <td class="no-print">
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input type="checkbox" onchange="toggleCharge(this,'gst')">
          <label>GST %</label>
          <input type="number" min="1" max="50" value="3" disabled onchange="calculateRowTotal(this)">
        </div>
        <div class="checkbox-item">
          <input type="checkbox" onchange="toggleCharge(this,'making')">
          <label>Making %</label>
          <input type="number" min="1" max="100" value="10" disabled onchange="calculateRowTotal(this)">
        </div>
        <div class="checkbox-item">
          <input type="checkbox" onchange="toggleCharge(this,'discount')">
          <label>Discount %</label>
          <input type="number" min="1" max="100" value="5" disabled onchange="calculateRowTotal(this)">
        </div>
      </div>
    </td>
    <td class="item-total">₹0.00</td>
  `;
  tbody.appendChild(row);
  calculateTotals();
}

// ==============================
// Charges Toggle
// ==============================
function toggleCharge(checkbox, type) {
  const input = checkbox.parentElement.querySelector('input[type="number"]');
  input.disabled = !checkbox.checked;

  if (type === "discount" && checkbox.checked) {
    currentDiscountRow = checkbox.closest("tr");
    document.getElementById("discountModal").style.display = "block";
  } else {
    calculateRowTotal(checkbox);
  }
}

function applyDiscount(type) {
  if (currentDiscountRow) {
    const discountCheckbox = currentDiscountRow.querySelector(
      'input[type="checkbox"][onchange*="discount"]'
    );
    discountCheckbox.setAttribute("data-discount-type", type);
    calculateRowTotal(discountCheckbox);
  }
  closeDiscountModal();
}

function closeDiscountModal() {
  document.getElementById("discountModal").style.display = "none";
  currentDiscountRow = null;
}

// ==============================
// Row Total Calculation
// ==============================
function calculateRowTotal(element) {
  const row = element.closest("tr");
  const qty = parseFloat(row.querySelector(".item-qty").value) || 0;
  const weight = parseFloat(row.querySelector(".item-weight").value) || 0;
  const weightUnit = row.querySelector(".item-weight-unit").value;
  const price = parseFloat(row.querySelector(".item-price").value) || 0;

  // convert mg → gm
  let finalWeight = weightUnit === "mg" ? weight / 1000 : weight;

  let baseAmount = qty * finalWeight * price;
  let finalAmount = baseAmount;

  // Making
  const makingCheckbox = row.querySelector(
    'input[type="checkbox"][onchange*="making"]'
  );
  if (makingCheckbox && makingCheckbox.checked) {
    const makingPercent =
      parseFloat(
        makingCheckbox.parentElement.querySelector('input[type="number"]').value
      ) || 0;
    finalAmount += baseAmount * makingPercent / 100;
  }

  // GST
  const gstCheckbox = row.querySelector(
    'input[type="checkbox"][onchange*="gst"]'
  );
  if (gstCheckbox && gstCheckbox.checked) {
    const gstPercent =
      parseFloat(
        gstCheckbox.parentElement.querySelector('input[type="number"]').value
      ) || 0;
    finalAmount += finalAmount * gstPercent / 100;
  }

  // Discount
  const discountCheckbox = row.querySelector(
    'input[type="checkbox"][onchange*="discount"]'
  );
  if (discountCheckbox && discountCheckbox.checked) {
    const discountPercent =
      parseFloat(
        discountCheckbox.parentElement.querySelector('input[type="number"]').value
      ) || 0;
    const discountType =
      discountCheckbox.getAttribute("data-discount-type") || "base";
    if (discountType === "base") {
      finalAmount -= baseAmount * discountPercent / 100;
    } else {
      finalAmount -= finalAmount * discountPercent / 100;
    }
  }

  row.querySelector(".item-total").textContent = `₹${finalAmount.toFixed(2)}`;
  calculateTotals();
}

// ==============================
// Totals Calculation
// ==============================
function calculateTotals() {
  const rows = document.querySelectorAll("#itemsBody tr");
  let subtotal = 0;
  let totalGST = 0;

  rows.forEach((row) => {
    const itemTotal = parseFloat(
      row.querySelector(".item-total").textContent.replace("₹", "")
    ) || 0;
    subtotal += itemTotal;
  });

  // SGST + CGST
  const sgst = totalGST / 2;
  const cgst = totalGST / 2;
  const roundOff = Math.round(subtotal) - subtotal;
  const grandTotal = Math.round(subtotal);

  document.getElementById("subtotal").textContent = `₹${(subtotal - totalGST).toFixed(2)}`;
  document.getElementById("sgst").textContent = `₹${sgst.toFixed(2)}`;
  document.getElementById("cgst").textContent = `₹${cgst.toFixed(2)}`;
  document.getElementById("roundOff").textContent = `₹${roundOff.toFixed(2)}`;
  document.getElementById("grandTotal").textContent = `₹${grandTotal.toFixed(2)}`;
  document.getElementById("amountWords").textContent =
    `Amount in Words: ${numberToWords(grandTotal)} Rupees Only`;

  calculateBalance();
}

// ==============================
// Balance
// ==============================
function calculateBalance() {
  const grandTotal = parseFloat(
    document.getElementById("grandTotal").textContent.replace("₹", "")
  ) || 0;
  const received = parseFloat(document.getElementById("receivedAmount").value) || 0;
  document.getElementById("balance").textContent = `₹${(grandTotal - received).toFixed(2)}`;
}

// ==============================
// Number to Words
// ==============================
function numberToWords(num) {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertHundreds(n) {
    let result = "";
    if (n >= 100) { result += ones[Math.floor(n/100)] + " Hundred "; n %= 100; }
    if (n >= 20) { result += tens[Math.floor(n/10)] + " "; if (n%10>0) result += ones[n%10]; }
    else if (n >= 10) result += teens[n-10];
    else if (n>0) result += ones[n];
    return result.trim();
  }

  const crores = Math.floor(num/10000000);
  const lakhs = Math.floor((num%10000000)/100000);
  const thousands = Math.floor((num%100000)/1000);
  const hundreds = num % 1000;

  let result = "";
  if (crores) result += convertHundreds(crores) + " Crore ";
  if (lakhs) result += convertHundreds(lakhs) + " Lakh ";
  if (thousands) result += convertHundreds(thousands) + " Thousand ";
  if (hundreds) result += convertHundreds(hundreds);
  return result.trim();
}

// ==============================
// Invoice Functions
// ==============================
function generateInvoice() {
  let invoiceField = document.getElementById("invoiceNo");

  // अगर invoice field खाली है तो default set करो
  if (!invoiceField.value) {
    invoiceField.value = "25-26-1";   // Default invoice number
  } else {
    // Current invoice split करके last number बढ़ाओ
    let parts = invoiceField.value.split("-");
    let currentNo = parseInt(parts[2]) || 0;
    let newNo = currentNo + 1;

    // First two parts same रहने दो (25-26), सिर्फ़ number बढ़ाओ
    invoiceField.value = `${parts[0]}-${parts[1]}-${newNo}`;
  }

  alert("Invoice generated successfully! 🎉");
}

function printInvoice() {
  document.body.classList.add("customer-view");
  window.print();
  setTimeout(() => document.body.classList.remove("customer-view"), 1000);
}

function resetInvoice() {
  if (confirm("Are you sure you want to reset the invoice?")) location.reload();
}

// ==============================
// Download PDF
// ==============================
// ==============================
// Download PDF (Single Page + Adjust Font)
// ==============================
function downloadPDF() {
  const invoice = document.querySelector(".container");

  const noPrintEls = document.querySelectorAll(".no-print");
  noPrintEls.forEach(el => el.style.display = "none");

  // Description को छोटा font कर दो ताकि PDF में फिट आए
  const desc = document.querySelector(".description-terms textarea");
  if (desc) {
    desc.style.fontSize = "12px";
    desc.style.lineHeight = "1.4";
  }

  html2canvas(invoice, { scale: 2, useCORS: true }).then((canvas) => {
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new window.jspdf.jsPDF("p", "pt", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // सब कुछ एक पेज में squeeze करना
    const imgWidth = pdfWidth;
    const imgHeight = canvas.height * (pdfWidth / canvas.width);

    // अगर height ज्यादा हो तो proportion कम कर दो
    let finalHeight = imgHeight;
    let finalWidth = imgWidth;
    if (imgHeight > pdfHeight) {
      finalHeight = pdfHeight;
      finalWidth = canvas.width * (pdfHeight / canvas.height);
    }

    pdf.addImage(imgData, "JPEG", 0, 0, finalWidth, finalHeight);
    pdf.save(`Invoice_${document.getElementById("invoiceNo").value}.pdf`);

    // वापस original कर दो
    if (desc) {
      desc.style.fontSize = "";
      desc.style.lineHeight = "";
    }

    noPrintEls.forEach(el => el.style.display = "");
  });
}
