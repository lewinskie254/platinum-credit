function showTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab =>
        tab.classList.remove('active')
    );

    document.querySelectorAll('.nav-btn').forEach(btn =>
        btn.classList.remove('active')
    );

    document.getElementById(tabName + '-tab').classList.add('active');
    event.currentTarget.classList.add('active');
}

// Inputs
const netSalaryInput = document.getElementById("netSalary");
const basicSalaryInput = document.getElementById("basicSalary");
const retirementDateInput = document.getElementById("retirementDate");

const specAmountInput = document.getElementById("specificAmount");
const specMonthsInput = document.getElementById("specificMonths");

// Utils
function numberWithCommas(x) {
    return Math.round(x)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function monthsUntilRetirement(retirementValue) {
    if (!retirementValue) return 1;

    const today = new Date();
    const retirement = new Date(retirementValue + "-01");

    const months =
        (retirement.getFullYear() - today.getFullYear()) * 12 +
        (retirement.getMonth() - today.getMonth());

    return Math.max(1, months);
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

// Eligibility
function calculateEligibility() {
    const net = Number(netSalaryInput.value) || 0;
    const basic = Number(basicSalaryInput.value) || 0;
    const months = monthsUntilRetirement(retirementDateInput.value);
    const rate = getInterestRate(months);

    const maxInstallment = Math.max(0, net - (basic / 3));
    const adjusted = maxInstallment - 240;

    const principal = adjusted > 0
        ? adjusted / ((1 + (rate * months)) / months)
        : 0;

    document.getElementById("maxMonthly").textContent =
        Math.round(maxInstallment).toLocaleString();

    document.getElementById("loanAmount").textContent =
        Math.round(principal).toLocaleString();

    document.getElementById("eligibilityWarning").style.display =
        (maxInstallment <= 0 || principal <= 0) ? "block" : "none";
}

// Repayment
function calculateRepayment() {
    const principal = parseFloat(specAmountInput.value) || 0;
    const months = parseInt(specMonthsInput.value) || 1;
    const rate = getInterestRate(months);

    const appraisalFee = principal * 0.125;
    const financed = principal + appraisalFee;

    const interestTotal = financed * rate * months;
    const totalPayable = financed + interestTotal;

    const monthly = totalPayable / months + 240;

    document.getElementById("repMonthly").textContent =
        numberWithCommas(monthly);

    document.getElementById("repRate").textContent =
        (rate * 100).toFixed(2);

    document.getElementById("repTotal").textContent =
        numberWithCommas(totalPayable);
}

// Init
function init() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('wheel', function(e) {
            e.preventDefault();
        }, { passive: false });
    });
    
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);

    if (!retirementDateInput.value) {
        retirementDateInput.value = futureDate.toISOString().substring(0, 7);
    }

    [netSalaryInput, basicSalaryInput, retirementDateInput].forEach(el => {
        el.addEventListener('input', calculateEligibility);
    });

    [specAmountInput, specMonthsInput].forEach(el => {
        el.addEventListener('input', calculateRepayment);
    });

    calculateEligibility();
    calculateRepayment();
}

init();