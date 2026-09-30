export const formatPhoneNumber = (input: string) =>
  input.replace(/[^0-9]/g, '').replace(/^(\d{3})(\d{4})(\d{4})$/, `$1-$2-$3`);
