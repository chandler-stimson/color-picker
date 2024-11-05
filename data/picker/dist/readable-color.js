var x = Object.defineProperty;
var y = (e, n, t) => n in e ? x(e, n, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[n] = t;
var c = (e, n, t) => (y(e, typeof n != "symbol" ? n + "" : n, t), t);
class m {
  constructor(n = 0, t = 0, i = 0) {
    c(this, "r", 0);
    c(this, "g", 0);
    c(this, "b", 0);
    this.r = n, this.g = t, this.b = i;
  }
  static fromHex(n) {
    const t = n.replace("#", ""), i = t.substring(0, 2), s = t.substring(2, 4), o = t.substring(4, 6);
    return new m(
      Math.min(255, Number.parseInt(i, 16)),
      Math.min(255, Number.parseInt(s, 16)),
      Math.min(255, Number.parseInt(o, 16))
    );
  }
  get hex() {
    var n = [this.r, this.g, this.b].map((t) => {
      var i = Math.round(t).toString(16);
      return i.length < 2 && (i = `0${i}`), i;
    });
    return `#${n.join("")}`;
  }
  /**
   * Convenience method to return a color given a HSL array;
   * @param hsl
   * @return
   */
  static fromHsl(n) {
    const t = C(n[0], n[1], n[2]);
    return new m(t[0], t[1], t[2]);
  }
  /**
   * Creates an HSL array from a given color
   * @param color the input color
   * @param hsl the HSL triple
   */
  get hsl() {
    return w(this.r, this.g, this.b);
  }
  /**
   * Returns the relative luminosity (luminance) of the given color. The value ranges from 0-255.
   * The weights were taken from http://en.wikipedia.org/wiki/Luminance_(relative)
   * Another, more authoritative reference mentioning these weights:
   * https://www.w3.org/WAI/WCAG22/Techniques/general/G18.html and
   * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
   *
   * @param color
   * @return
   */
  luminosity() {
    const n = this.r / 255, t = this.g / 255, i = this.b / 255;
    return 0.2126 * Math.pow(n, 2.2) + 0.7152 * Math.pow(t, 2.2) + 0.0722 * Math.pow(i, 2.2);
  }
}
function w(e, n, t) {
  const i = e / 255, s = n / 255, o = t / 255, l = Math.min(i, Math.min(s, o)), r = Math.max(i, Math.max(s, o)), a = r - l;
  let u = 0, h, f;
  if (f = (r + l) / 2, a == 0)
    u = 0, h = 0;
  else {
    f < 0.5 ? h = a / (r + l) : h = a / (2 - r - l);
    const g = ((r - i) / 6 + a / 2) / a, d = ((r - s) / 6 + a / 2) / a, b = ((r - o) / 6 + a / 2) / a;
    i == r ? u = b - d : s == r ? u = 1 / 3 + g - b : o == r && (u = 2 / 3 + d - g), u < 0 && (u += 1), u > 1 && (u -= 1);
  }
  return [Math.round(360 * u), Math.round(h * 100), Math.round(f * 100)];
}
function C(e, n, t) {
  const i = e / 360, s = n / 100, o = t / 100;
  let l, r, a, u, h;
  return s == 0 ? (l = o * 255, r = o * 255, a = o * 255) : (o < 0.5 ? h = o * (1 + s) : h = o + s - s * o, u = 2 * o - h, l = 255 * M(u, h, i + 1 / 3), r = 255 * M(u, h, i), a = 255 * M(u, h, i - 1 / 3)), [Math.round(l), Math.round(r), Math.round(a)];
}
function M(e, n, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), 6 * t < 1 ? e + (n - e) * 6 * t : 2 * t < 1 ? n : 3 * t < 2 ? e + (n - e) * (2 / 3 - t) * 6 : e;
}
function p(e) {
  return typeof e == "string";
}
function W(e, n, t) {
  let i, s, o;
  switch (t) {
    default:
    case "W3C":
      return L(e, n) >= 500;
    case "Luminosity":
      return i = e.luminosity(), s = n.luminosity(), Math.min(i, s) / Math.max(i, s) <= 1 / 10;
    case "LuminosityContrast":
      i = e.luminosity(), s = n.luminosity();
      const r = Math.abs(i - s);
      return o = 1, 116 * Math.pow(r / o, 1 / 3) > 100;
    case "WCAG":
      return I(e, n) >= 4.5;
  }
}
function G(e, n = "W3C") {
  let t;
  p(e) ? t = m.fromHex(e) : t = e;
  const i = t.luminosity();
  let s = t, [o, l, r] = t.hsl;
  r = Math.max(1, r);
  let a = (h) => Math.max(0, h * 0.8);
  i < 0.43 && (a = (h) => Math.min(100, h * 1.2)), r = a(r), s = m.fromHsl([o, l, r]);
  let u = 0;
  for (; !W(t, s, n) && u < 50; )
    r = a(r), s = m.fromHsl([o, l, r]), u += 1;
  return p(e) ? s.hex : s;
}
function L(e, n) {
  return Math.max(e.r, n.r) - Math.min(e.r, n.r) + (Math.max(e.g, n.g) - Math.min(e.g, n.g)) + (Math.max(e.b, n.b) - Math.min(e.b, n.b));
}
function I(e, n) {
  const t = e.luminosity(), i = n.luminosity();
  return (Math.max(t, i) + 0.05) / (Math.min(t, i) + 0.05);
}
export {
  G as getReadableColor
};
