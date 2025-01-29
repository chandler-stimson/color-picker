/* global Pickr, EyeDropper */

import {getReadableColor} from './dist/readable-color.js';

const toast = msg => {
  clearTimeout(toast.id);
  const e = document.getElementById('toast');
  e.textContent = msg;
  toast.id = setTimeout(() => {
    e.textContent = '';
  }, 750);
};

chrome.storage.local.get({
  swatches: [],
  representation: 'HEX', // HEX, RGBA, HSVA, HSLA and CMYK
  precision: 2
}, prefs => {
  const pickr = Pickr.create({
    el: '#pickr',
    theme: 'classic', // or 'monolith', or 'nano'
    inline: true,
    showAlways: true,
    useAsButton: true,
    swatches: prefs.swatches,
    default: prefs.swatches[0] || '#42445a',
    defaultRepresentation: prefs.representation,
    outputPrecision: prefs.precision,
    adjustableNumbers: true,
    components: {
      palette: true,
      preview: true,
      opacity: true,
      hue: true,

      // Input / output Options
      interaction: {
        hex: true,
        rgba: true,
        hsla: true,
        hsva: true,
        cmyk: true,
        input: true,
        clear: false,
        save: true
      }
    }
  });
  console.log(pickr);
  pickr.on('save', color => {
    // save in RGBA to follow the requested precision
    const c = color.toRGBA().toString(prefs.precision);
    const swatches = prefs.swatches = [c, ...prefs.swatches].filter((s, n, l) => s && l.indexOf(s) === n).slice(0, 6);

    prefs.swatches.forEach(() => pickr.removeSwatch(0));
    swatches.forEach(c => pickr.addSwatch(c));

    chrome.storage.local.set({
      swatches
    });
  });
  pickr.on('init', () => {
    document.querySelector('.pcr-save').title = `Click or Press 'S' to save the current color`;
    document.querySelector('.pcr-save').accesskey = 's';
    pickr._emit('change', pickr.getColor());
  });
  document.getElementById('native').onclick = async () => {
    try {
      const eyeDropper = new EyeDropper();
      const o = await eyeDropper.open();
      const representation = pickr.getColorRepresentation();
      pickr.setColor(o.sRGBHex);
      pickr.setColorRepresentation(representation);
      // Save in the current representation
      const c = pickr.getColor()['to' + representation]().toString(prefs.precision);
      await navigator.clipboard.writeText(c);
      toast('copied');
    }
    catch (e) {
      toast('Error: ' + e.message);
      console.error(e);
    }
  };
  pickr.on('change', color => {
    const hex = color.toHEXA().toString().slice(0, 7);

    const algorithm = 'LuminosityContrast'; // W3C, WCAG, Luminosity
    const readableHex = getReadableColor(hex, algorithm);

    const e = document.getElementById('readable');
    e.value = readableHex;
    e.style['background-color'] = hex;
    e.style['color'] = readableHex;
  });
  document.addEventListener('click', e => {
    if (e.isTrusted && e.target.classList.contains('pcr-type')) {
      setTimeout(() => chrome.storage.local.set({
        representation: pickr.getColorRepresentation()
      }), 100);
    }
  }, true);
  document.addEventListener('click', async e => {
    try {
      if (e.isTrusted && e.target.classList.contains('pcr-result')) {
        e.target.select();
        await navigator.clipboard.writeText(e.target.value);
        toast('copied');
      }
      else if (e.isTrusted && e.target.id === 'readable') {
        await navigator.clipboard.writeText(e.target.value);
        toast('copied');
      }
    }
    catch (e) {
      toast('Error: ' + e.message);
      console.error(e);
    }
  });
});

chrome.storage.local.get({
  'remote-picker': 'https://webbrowsertools.com/color-picker/'
}, prefs => {
  document.getElementById('samples').href = prefs['remote-picker'];
});

document.addEventListener('keydown', e => {
  if (e.code === 'KeyE') {
    document.getElementById('native').click();
  }
  else if (e.code === 'KeyS') {
    document.querySelector('.pcr-save').click();
  }
});
