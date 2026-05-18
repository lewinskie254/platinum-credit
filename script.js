const netSalaryInput = document.getElementById("netSalary");
const basicSalaryInput = document.getElementById("basicSalary");
const retirementDateInput = document.getElementById("retirementDate");
const durationSlider = document.getElementById("durationSlider");
const sliderValueDisplay = document.getElementById("sliderValue");

const maxMonthlyDisplay = document.getElementById("maxMonthly");
const durationMonthsDisplay = document.getElementById("durationMonths");
const interestRateDisplay = document.getElementById("interestRate");
const loanAmountDisplay = document.getElementById("loanAmount");
const totalRepaymentDisplay = document.getElementById("totalRepayment");

let maxAllowedMonths = 120; // Default fallback global max

function numberWithCommas(x) {
  return Math.round(x)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getInterestRate(months) {
  if (months >= 108) return 0.0235;
  if (months >= 84) return 0.025344;
  if (months >= 72) return 0.024502;
  if (months >= 60) return 0.027485;
  if (months >= 40) return 0.028797;
  if (months >= 36) return 0.036914;
  if (months >= 24) return 0.044260;
  if (months >= 12) return 0.052964;
  if (months >= 6) return 0.053077;
  return 0.058352;
}

// 1. Logic handler for changes to the retirement date field
function handleRetirementDateChange() {
  const retirementDateValue = retirementDateInput.value;

  if (!retirementDateValue) {
    durationSlider.disabled = true;
    return;
  }

  const today = new Date();
  const retirementDate = new Date(retirementDateValue + "-01");

  let calculatedMonths =
    (retirementDate.getFullYear() - today.getFullYear()) * 12 +
    (retirementDate.getMonth() - today.getMonth());

  if (calculatedMonths < 1) calculatedMonths = 1;
  if (calculatedMonths > 120) calculatedMonths = 120;

  // Track the upper ceiling based strictly on retirement age
  maxAllowedMonths = calculatedMonths;

  // Update slider restrictions
  durationSlider.max = maxAllowedMonths;
  durationSlider.disabled = false;

  // Keep slider synchronized if it exceeds the new retirement cap
  if (parseInt(durationSlider.value) > maxAllowedMonths) {
    durationSlider.value = maxAllowedMonths;
    sliderValueDisplay.textContent = maxAllowedMonths;
  }

  calculateLoan();
}

// 2. Core math calculations 
function calculateLoan() {
  const netSalary = parseFloat(netSalaryInput.value) || 0;
  const basicSalary = parseFloat(basicSalaryInput.value) || 0;

  if (!retirementDateInput.value) {
    return;
  }

  // Active duration targets what the user selected via the slider
  const selectedMonths = parseInt(durationSlider.value) || 1;

  // Formula: max monthly = net - basic/3
  let maxMonthlyInstallment = netSalary - (basicSalary / 3);
  
  // Guard against negative installment limits
  if (maxMonthlyInstallment < 0) {
    maxMonthlyInstallment = 0;
  }

  const interestRate = getInterestRate(selectedMonths);

  // Reverse engineer loan amount from installment
  // monthly = ((principal + principal*r*n)/n)+240
  const adjustedMonthly = maxMonthlyInstallment - 240;

  let principal = 0;
  let totalRepayment = 0;

  // Only calculate if the installment covers the 240 base charge
  if (adjustedMonthly > 0) {
    principal =
      adjustedMonthly /
      ((1 + (interestRate * selectedMonths)) / selectedMonths);

    const appraisalFee = principal * 0.125;
    const financedAmount = principal + appraisalFee;

    const totalInterest = financedAmount * interestRate * selectedMonths;
    totalRepayment = financedAmount + totalInterest;
  }

  // Double check to prevent fallback anomalies below 0
  if (principal < 0) principal = 0;
  if (totalRepayment < 0) totalRepayment = 0;

  // Render to UI
  maxMonthlyDisplay.textContent = numberWithCommas(maxMonthlyInstallment);
  durationMonthsDisplay.textContent = selectedMonths;
  interestRateDisplay.textContent = (interestRate * 100).toFixed(2);
  loanAmountDisplay.textContent = numberWithCommas(principal);
  totalRepaymentDisplay.textContent = numberWithCommas(totalRepayment);
}

// Helper to set a default date on initial load 
function initDefaultDate() {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 10); 
  
  const year = futureDate.getFullYear();
  const month = String(futureDate.getMonth() + 1).padStart(2, '0');
  
  retirementDateInput.value = `${year}-${month}`;
  handleRetirementDateChange();
}

// Event Listeners
netSalaryInput.addEventListener("input", calculateLoan);
basicSalaryInput.addEventListener("input", calculateLoan);
retirementDateInput.addEventListener("input", handleRetirementDateChange);

durationSlider.addEventListener("input", (e) => {
  sliderValueDisplay.textContent = e.target.value;
  calculateLoan();
});

// Initialization
initDefaultDate();