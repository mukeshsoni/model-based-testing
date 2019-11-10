import cloneDeep from "clone-deep";

/*
 * This function helps extend the machine object with external object
 * which only has validation code for each state. This makes it easier
 * to use the common machine object with state validators for different
 * testing environments. E.g. cypress, regular jest, puppeteer etc.
 */
function withStateValidators(stateValidators, machine) {
  const machineCopy = cloneDeep(machine); // quick deep copy.

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

export default withStateValidators;
