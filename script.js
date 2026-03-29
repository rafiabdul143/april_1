// Format helper
const fmt = (n) => {
  if (typeof n !== 'number' || isNaN(n)) return '₹0.00';
  return '₹' + n.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
};

document.getElementById('epfForm').onsubmit = function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const employeeShare = parseFloat(document.getElementById('employeeShare').value) || 0;
  const employerShare = parseFloat(document.getElementById('employerShare').value) || 0;
  const years = parseFloat(document.getElementById('years').value) || 0;
  const numberOfCompanies = parseInt(document.getElementById('companies').value, 10) || 1;
  const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
  const reason = document.getElementById('reason').value;
  const requiredAmountInput = document.getElementById('requiredAmount').value;
  const requiredAmount = requiredAmountInput !== '' ? parseFloat(requiredAmountInput) : null;

  const totalBalance = employeeShare + employerShare;

  let message = `<b>Name:</b> ${name || '-'}<br>`;
  message += `<b>Total Service (years):</b> ${years}<br>`;
  message += `<b>Companies Worked:</b> ${numberOfCompanies}<br>`;
  message += `<b>Employee Share:</b> ${fmt(employeeShare)}<br>`;
  message += `<b>Employer Share:</b> ${fmt(employerShare)}<br>`;
  message += `<b>Basic Salary (monthly):</b> ${fmt(basicSalary)}<br><br>`;

  if (numberOfCompanies >= 2 && years >= 5) {
    message += '⚠️ Multiple companies: ensure all PF accounts are transferred for correct service calculation.<br><br>';
  }

  let maxEligible = 0;
  let requirementFailed = false;

  // (shortened for clarity — same switch logic as before)
  switch (reason) {
    case 'illness': maxEligible = Math.min(basicSalary * 6, employeeShare); break;
    case 'natural': maxEligible = Math.min(basicSalary * 12, employeeShare); break;
    case 'powercut': maxEligible = 300; break;
    case 'marriage': if (years<7){requirementFailed=true; message+="❌ Need 7+ years for Marriage.<br>";} else maxEligible = employeeShare*0.5; break;
    case 'education': if (years<7){requirementFailed=true; message+="❌ Need 7+ years for Education.<br>";} else maxEligible = employeeShare*0.5; break;
    case 'handicap': maxEligible = Math.min(basicSalary*6, employeeShare); break;
    case 'site': if (years<5){requirementFailed=true; message+="❌ Need 5+ years for Site Purchase.<br>";} else maxEligible = Math.min(basicSalary*24,totalBalance); break;
    case 'construction':
    case 'promoter_purchase':
    case 'agency_purchase': if (years<5){requirementFailed=true; message+="❌ Need 5+ years for House Purchase.<br>";} else maxEligible = Math.min(basicSalary*36,totalBalance); break;
    case 'additions': if (years<5){requirementFailed=true; message+="❌ Need 5+ years for Additions.<br>";} else maxEligible = Math.min(basicSalary*12,employeeShare); break;
    case 'loanrepay': if (years<10){requirementFailed=true; message+="❌ Need 10+ years for Loan Repayment.<br>";} else maxEligible = Math.min(basicSalary*36,totalBalance); break;
    case 'lockout': maxEligible = employeeShare; break;
    case 'dismissal': maxEligible = employeeShare*0.5; break;
    case 'closure6m': maxEligible = employerShare; break;
    case 'vpby': maxEligible = totalBalance; break;
    case 'continuous_unemployment': maxEligible =  totalBalance*0.75; break;
    case 'nowages': maxEligible = employeeShare; break;
    case 'retirement': maxEligible = totalBalance*0.9; break;
    default: requirementFailed = true;
  }

  if (requirementFailed) {
    document.getElementById('finalBox').innerHTML = "❌ Not Eligible";
    document.getElementById('result').innerHTML = message;
    return;
  }

  let finalEligible = maxEligible;
  let finalMsg = "";

  if (requiredAmount !== null && !isNaN(requiredAmount)) {
    if (requiredAmount <= 0) {
      finalMsg = "❌ Requested amount must be greater than 0.";
    } else if (requiredAmount <= maxEligible) {
      finalEligible = requiredAmount;
      message += `<b>Requested:</b> ${fmt(requiredAmount)} (within limit)<br>`;
    } else {
      message += `⚠️ Requested ${fmt(requiredAmount)} > allowed ${fmt(maxEligible)}<br>`;
    }
  }

  // Show Final Eligibility prominently
  document.getElementById('finalBox').innerHTML = `Final Eligibility: ${fmt(finalEligible)}`;
  document.getElementById('result').innerHTML = message;
};
