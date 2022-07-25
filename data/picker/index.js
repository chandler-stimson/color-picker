/* global Pickr, EyeDropper */

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
  representation: 'HEX' // HEX, RGBA, HSVA, HSLA and CMYK
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
  pickr.on('save', color => {
    const c = color.toHEXA().toString();
    const swatches = prefs.swatches = [c, ...prefs.swatches].filter((s, n, l) => s && l.indexOf(s) === n).slice(0, 6);

    prefs.swatches.forEach(() => pickr.removeSwatch(0));
    swatches.forEach(c => pickr.addSwatch(c));

    chrome.runtime.sendMessage({
      method: 'swatches',
      swatches
    });
  });
  document.getElementById('inspect').onclick = () => {
    const eyeDropper = new EyeDropper();
    eyeDropper.open().then(o => {
      pickr.setColor(o.sRGBHex);
      navigator.clipboard.writeText(o.sRGBHex.toLowerCase()).then(() => toast('copied'));
    });
  };
  document.addEventListener('click', e => {
    if (e.isTrusted && e.target.classList.contains('pcr-type')) {
      setTimeout(() => chrome.storage.local.set({
        representation: pickr.getColorRepresentation()
      }), 100);
    }
  }, true);
  document.addEventListener('click', e => {
    if (e.isTrusted && e.target.classList.contains('pcr-result')) {
      e.target.select();
      navigator.clipboard.writeText(e.target.value.toLowerCase()).then(() => toast('copied'));
    }
  });
});

