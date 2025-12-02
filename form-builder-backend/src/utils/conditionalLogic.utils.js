function shouldShowQuestion(rules, answers) {
  if (!rules) return true;
  let result = rules.logic === 'AND';
  
  for (const condition of rules.conditions) {
    const answerValue = answers[condition.questionKey];
    let conditionResult = false;
    
    switch(condition.operator) {
      case 'equals': conditionResult = answerValue === condition.value; break;
      case 'notEquals': conditionResult = answerValue !== condition.value; break;
      case 'contains': conditionResult = String(answerValue).includes(condition.value); break;
    }
    
    if (rules.logic === 'AND') result = result && conditionResult;
    else result = result || conditionResult;
  }
  return result;
}

function validateForm(form, answers) {
  const missing = form.questions.filter(q => 
    q.required && !answers[q.fieldId]
  );
  if (missing.length) throw new Error(`Missing: ${missing.map(q => q.label).join(', ')}`);

  form.questions.forEach(q => {
    if (q.conditionalRules) {
      const shouldShow = shouldShowQuestion(q.conditionalRules, answers);
      if (q.required && !shouldShow) {
        throw new Error(`${q.label} is conditionally required`);
      }
    }
  });
}

module.exports = { validateForm, shouldShowQuestion };
