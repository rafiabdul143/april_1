// helper to format amounts
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
  message += `<b>Number of Companies:</b> ${numberOfCompanies}<br>`;
  message += `<b>Employee Share:</b> ${fmt(employeeShare)}<br>`;
  message += `<b>Employer Share:</b> ${fmt(employerShare)}<br>`;
  message += `<b>Basic Salary (monthly):</b> ${fmt(basicSalary)}<br><br>`;

  if (numberOfCompanies >= 2 && years >= 5) {
    message += '⚠️ Multiple companies: ensure previous PF accounts are transferred/linked for correct service calculation.<br><br>';
  }

  let maxEligible = 0;
  let requirementFailed = false;

  switch (reason) {
    case 'illness':
      maxEligible = Math.min(basicSalary * 6, employeeShare);
      message += `✔️ <b>Illness:</b> Up to 6× Basic Salary OR Employee Share.<br>`;
      break;
    case 'natural':
      maxEligible = Math.min(basicSalary * 12, employeeShare);
      message += `✔️ <b>Natural Calamities:</b> Up to 12× Basic Salary OR Employee Share.<br>`;
      break;
    case 'powercut':
      maxEligible = 300;
      message += `✔️ <b>Power Cut:</b> Fixed ₹300 only.<br>`;
      break;
    case 'marriage':
      if (years < 7) { message += "❌ 7+ years' service required for Marriage.<br>"; requirementFailed = true; break; }
      maxEligible = employeeShare * 0.5;
      message += `✔️ <b>Marriage:</b> Up to 50% of Employee Share.<br>`;
      break;
    case 'education':
      if (years < 7) { message += "❌ 7+ years' service required for Higher Education.<br>"; requirementFailed = true; break; }
      maxEligible = employeeShare * 0.5;
      message += `✔️ <b>Higher Education:</b> Up to 50% of Employee Share.<br>`;
      break;
    case 'handicap':
      maxEligible = Math.min(basicSalary * 6, employeeShare);
      message += `✔️ <b>Handicap Equipment:</b> Up to 6× Basic Salary OR Employee Share.<br>`;
      break;
    case 'site':
      if (years < 5) { message += "❌ 5+ years' service required for Site Purchase.<br>"; requirementFailed = true; break; }
      maxEligible = Math.min(basicSalary * 24, totalBalance);
      message += `✔️ <b>Purchase of Site:</b> Up to 24× Basic Salary OR Total Balance.<br>`;
      break;
    case 'construction':
    case 'promoter_purchase':
    case 'agency_purchase':
      if (years < 5) { message += "❌ 5+ years' service required for House purchase / construction.<br>"; requirementFailed = true; break; }
      maxEligible = Math.min(basicSalary * 36, totalBalance);
      message += `✔️ <b>House Purchase / Construction:</b> Up to 36× Basic Salary OR Total Balance.<br>`;
      break;
    case 'additions':
      if (years < 5) { message += "❌ 5+ years' service required for Additions / Alterations.<br>"; requirementFailed = true; break; }
      maxEligible = Math.min(basicSalary * 12, employeeShare);
      message += `✔️ <b>Additions / Alterations of House:</b> Up to 12× Basic Salary OR Employee Share.<br>`;
      break;
    case 'loanrepay':
      if (years < 10) { message += "❌ 10+ years' service required for Loan Repayment.<br>"; requirementFailed = true; break; }
      maxEligible = Math.min(basicSalary * 36, totalBalance);
      message += `✔️ <b>Loan Repayment:</b> Up to 36× Basic Salary OR Total Balance.<br>`;
      break;
    case 'lockout':
      maxEligible = employeeShare;
      message += `✔️ <b>Lockout / Closure:</b> Up to Full Employee Share.<br>`;
      break;
    case 'dismissal':
      maxEligible = employeeShare * 0.5;
      message += `✔️ <b>Dismissal Challenged in Court:</b> Up to 50% of Employee Share.<br>`;
      break;
    case 'closure6m':
      maxEligible = employerShare;
      message += `✔️ <b>Closure &gt; 6 months:</b> Up to Employer Share.<br>`;
      break;
    case 'vpby':
      maxEligible = totalBalance;
      message += `✔️ <b>Varistha Pension Bima Yojana:</b> Up to Total Balance.<br>`;
      break;
    case 'continuous_unemployment':
      maxEligible = employeeShare;
      message += `✔️ <b>Continuous Unemployment (&gt;1 month):</b> Up to Full Employee Share.<br>`;
      break;
    case 'nowages':
      maxEligible = totalBalance * 0.75;
      message += `✔️ <b>Non Receipt of Wages (&gt;2 months):</b> Up to 75% of Total Balance.<br>`;
      break;
    case 'retirement':
      maxEligible = totalBalance * 0.9;
      message += `✔️ <b>Retirement:</b> Up to 90% of Total Balance.<br>`;
      break;
    default:
      message += "❌ Please select a valid reason.<br>";
      requirementFailed = true;
  }

  if (requirementFailed) {
    document.getElementById('result').innerHTML = message;
    return;
  }

  if (maxEligible > 0) {
    let finalEligible = maxEligible;

    if (requiredAmount !== null && !isNaN(requiredAmount)) {
      if (requiredAmount <= 0) {
        message += `<br>❌ Requested amount must be greater than 0.<br>`;
      } else if (requiredAmount <= maxEligible) {
        finalEligible = requiredAmount;
        message += `<br><b>Requested Amount:</b> ${fmt(requiredAmount)}<br>`;
        message += `<b>Final Eligibility (requested ≤ allowed):</b> ${fmt(finalEligible)}<br>`;
      } else {
        message += `<br>⚠️ You requested ${fmt(requiredAmount)}, which is greater than the permitted maximum.<br>`;
        message += `<b>Maximum Permitted:</b> ${fmt(maxEligible)}<br>`;
        message += `<b>Final Eligibility:</b> ${fmt(maxEligible)}<br>`;
      }
    } else {
      message += `<br><b>Maximum Permitted:</b> ${fmt(maxEligible)}<br>`;
    }
  } else {
    message += `<br>❌ No eligible amount calculated for the selected reason.`;
  }

  document.getElementById('result').innerHTML = message;
};
