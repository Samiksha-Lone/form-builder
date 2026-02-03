export function shouldShowQuestion(rules, answersSoFar) {
  if (!rules) return true;

  const { logic, conditions } = rules;
  if (!conditions || conditions.length === 0) return true;

  const evalCondition = (cond) => {
    const actual = answersSoFar[cond.questionKey];
    const expected = cond.value;

    if (cond.operator === 'equals') {
      return actual === expected;
    }
    if (cond.operator === 'notEquals') {
      return actual !== expected;
    }
    if (cond.operator === 'contains') {
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      if (typeof actual === 'string') {
        return actual.includes(String(expected));
      }
      return false;
    }
    return true; 
  };

  const results = conditions.map(evalCondition);

  if (logic === 'OR') {
    return results.some(Boolean);
  }
  return results.every(Boolean);
}
