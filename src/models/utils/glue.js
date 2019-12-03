import cloneDeep from "clone-deep";

/*
 * This function helps extend the machineConfig object with external object
 * which only has validation code for each state. This makes it easier
 * to use the common machineConfig object with state validators for different
 * testing environments. E.g. cypress, regular jest, puppeteer etc.
 */
export function withStateValidators(stateValidators, machineConfig) {
  const machineCopy = cloneDeep(machineConfig); // quick deep copy.

  Object.entries(stateValidators).forEach(([statePath, validator]) => {
    const pathParts = statePath.split(".");
    const newPathParts = pathParts.map(part => ["states", part]).flat();

    const stateProp = newPathParts.reduce((acc, pathPart) => {
      return acc[pathPart];
    }, machineCopy);

    stateProp.meta = stateProp.meta || {};

    stateProp.meta = {
      ...stateProp.meta,
      test: validator
    };
  });

  return machineCopy;
}

function isTransientState(machineConfig, state) {
  return (
    !machineConfig.states[state].on ||
    !Object.keys(machineConfig.states[state].on).includes("")
  );
}

/*
 * Given a machineConfig, this function will give the list of all
 * the states for which validators are required.
 */
export function requiredStateValidators(machineConfig) {
  if (!machineConfig.states) {
    return [];
  }

  let states = Object.keys(machineConfig.states);
  let stateConfig = machineConfig;

  // concatenate the top level states with the states gathered from
  // recursive traversal of nested states
  return states.filter(isTransientState.bind(null, machineConfig)).concat(
    states
      .filter(isTransientState.bind(null, machineConfig))
      .map(state => {
        return requiredStateValidators(machineConfig.states[state]).map(
          s => `${state}.${s}`
        );
      })
      .flat()
  );
}
