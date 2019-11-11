import top100Films from "./top_films";

// Teach Autosuggest how to calculate suggestions for any given input value.
export const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0
    ? top100Films
    : top100Films.filter(
        lang => lang.title.toLowerCase().slice(0, inputLength) === inputValue
      );
};

