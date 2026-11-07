/** Israeli phone: landline 0[2-4,8,9]-xxxxxxx, mobile 05x-xxxxxxx, 07x-xxxxxxx; +972 accepted. */
export function isIsraeliPhone(v: string): boolean {
  let d = v.replace(/[\s\-().]/g, '');
  if (d.startsWith('+972')) d = '0' + d.slice(4);
  else if (d.startsWith('972')) d = '0' + d.slice(3);
  return /^0(?:[23489]\d{7}|[57]\d{8})$/.test(d);
}
