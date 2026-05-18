function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
    event.currentTarget.classList.add('active');
}

const netSalaryInput = document.getElementById("netSalary");
const basicSalaryInput = document.getElementById("basicSalary");
const retirementDateInput = document.getElementById("retirementDate");
// const eligMonthsInput = document.getElementById("eligibilityMonths");

const specAmountInput = document.getElementById("specificAmount");
const specMonthsInput = document.getElementById("specificMonths");

function numberWithCommas(x) {
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function monthsUntilRetirement(retirementValue) {
    if (!retirementValue) return 1;

    const today = new Date();
    const retirement = new Date(retirementValue + "-01");

    let months =
        (retirement.getFullYear() - today.getFullYear()) * 12 +
        (retirement.getMonth() - today.getMonth());

    return Math.max(1, months);
}

function getInterestRate(months) {
    if (months >= 108) return 0.0235;
    else if (months >= 84) return 0.025344;
    else if (months >= 72) return 0.024502;
    else if (months >= 60) return 0.027485;
    else if (months >= 40) return 0.028797;
    else if (months >= 36) return 0.036914;
    else if (months >= 24) return 0.044260;
    else if (months >= 12) return 0.052964;
    else if (months >= 6) return 0.053077;
    else return 0.058352;
}

function calculateEligibility() {
    const net = parseFloat(netSalaryInput.value) || 0;
    const basic = parseFloat(basicSalaryInput.value) || 0;
    const n = parseInt(eligMonthsInput.value) || 1;
    const r = getInterestRate(n);

    let maxInstallment = net - (basic / 3);
    if (maxInstallment < 0) maxInstallment = 0;

    const adjustedMonthly = maxInstallment - 240;
    let principal = 0;
    if (adjustedMonthly > 0) {
        principal = adjustedMonthly / ((1 + (r * n)) / n);
    }

    const appraisalFee = principal * 0.125;
    const financed = principal + appraisalFee;
    const totalRepay = financed + (financed * r * n);

    document.getElementById("maxMonthly").textContent = numberWithCommas(maxInstallment);
    document.getElementById("loanAmount").textContent = numberWithCommas(principal);
    // document.getElementById("totalRepayment").textContent = numberWithCommas(totalRepay);
}

function calculateEligibility() {
    const net = parseFloat(netSalaryInput.value) || 0;
    const basic = parseFloat(basicSalaryInput.value) || 0;

    const n = monthsUntilRetirement(retirementDateInput.value);
    const r = getInterestRate(n);

    let maxInstallment = net - (basic / 3);
    if (maxInstallment < 0) maxInstallment = 0;

    const adjustedMonthly = maxInstallment - 240;

    let principal = 0;
    if (adjustedMonthly > 0) {
        principal = adjustedMonthly / ((1 + (r * n)) / n);
    }

    const appraisalFee = principal * 0.125;
    const financed = principal + appraisalFee;
    const totalRepay = financed + (financed * r * n);

    document.getElementById("maxMonthly").textContent = numberWithCommas(maxInstallment);
    document.getElementById("loanAmount").textContent = numberWithCommas(principal);
}

function init() {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    retirementDateInput.value = futureDate.toISOString().substring(0, 7);

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