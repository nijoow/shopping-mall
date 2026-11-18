export const commaToCurrency = (input: number) => {
  const str = input.toString();
  return `${str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};
