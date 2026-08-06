(function () {
  "use strict";

  const T = window.TT;
  const $ = (id) => document.getElementById(id);

  const els = {
    input: $("compressInput"),
    uploadBtn: $("compressUploadBtn"),
    editor: $("compressEditor"),
    qualityRange: $("qualityRange"),
    qualityValue: $("qualityValue"),
    maxWidthRange: $("maxWidthRange"),
    maxWidthValue: $("maxWidthValue"),
    preview: $("compressPreview"),
    sizeCompare: $("sizeCompare"),
    download: $("compressDownload"),
  };

  let img = null;
  let originalBytes = 0;
  let originalName = "image";

  function startWithImage(loadedImg, sizeHint, nameHint) {
    img = loadedImg;
    originalBytes = sizeHint || 0;
    originalName = nameHint || "image";
    els.editor.hidden = false;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function makeDemoImage() {
    const c = document.createElement("canvas");
    c.width = 2400;
    c.height = 1600;
    const ctx = c.getContext("2d");
    const grd = ctx.createLinearGradient(0, 0, 2400, 1600);
    grd.addColorStop(0, "#FFD9A0");
    grd.addColorStop(0.6, "#FF9E80");
    grd.addColorStop(1, "#5D8BD4");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 2400, 1600);
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = "rgba(255,255,255," + Math.random().toFixed(2) + ")";
      ctx.fillRect(Math.random() * 2400, Math.random() * 1600, 2, 2);
    }
    const img = new Image();
    img.onload = () => startWithImage(img, 3.6 * 1024 * 1024, "demo-photo.jpg");
    img.src = c.toDataURL("image/png");
  }

  async function render() {
    if (!img) return;
    const quality = Number(els.qualityRange.value) / 100;
    const maxW = Number(els.maxWidthRange.value);

    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    // 有损压缩统一输出 JPEG（照片效果最好）；100% 时保留原格式
    const type = quality >= 1 ? "image/png" : "image/jpeg";
    const blob = await T.canvasToBlob(c, type, quality < 1 ? quality : 0.92);
    const outBytes = blob.size;

    els.preview.innerHTML = "";
    const im = document.createElement("img");
    im.src = URL.createObjectURL(blob);
    els.preview.appendChild(im);

    const pct = originalBytes ? Math.round((1 - outBytes / originalBytes) * 100) : 0;
    els.sizeCompare.innerHTML =
      '<div class="size-box original"><strong>' + T.formatBytes(originalBytes) + "</strong><small>原始大小</small></div>" +
      '<div class="size-box result"><strong>' + T.formatBytes(outBytes) + "</strong><small>压缩后 · 减少 " + Math.max(0, pct) + "%</small></div>";

    els.download.onclick = () => {
      T.downloadBlob(blob, originalName.replace(/\.[^.]+$/, "") + "-compressed.jpg");
    };
  }

  els.uploadBtn.addEventListener("click", () => els.input.click());
  els.input.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      startWithImage(await T.loadImage(file), file.size, file.name || "image");
    } catch (err) {
      T.toast(err.message || "图片加载失败");
    }
  });

  els.qualityRange.addEventListener("input", () => {
    els.qualityValue.textContent = els.qualityRange.value;
    render();
  });
  els.maxWidthRange.addEventListener("input", () => {
    els.maxWidthValue.textContent = els.maxWidthRange.value;
    render();
  });

  if (location.search.indexOf("demo") !== -1) {
    makeDemoImage();
  }
})();
