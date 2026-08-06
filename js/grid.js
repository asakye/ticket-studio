(function () {
  "use strict";

  const T = window.TT;
  const $ = (id) => document.getElementById(id);

  const els = {
    input: $("gridInput"),
    uploadBtn: $("gridUploadBtn"),
    editor: $("gridEditor"),
    preview: $("gridPreview"),
    modeRow: $("gridModeRow"),
    saveAll: $("gridSaveAll"),
  };

  let img = null;
  let mode = 3;
  let pieces = []; // { blob, url }

  function startWithImage(loadedImg) {
    img = loadedImg;
    els.editor.hidden = false;
    build();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function makeDemoImage() {
    const c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1080;
    const ctx = c.getContext("2d");
    const grd = ctx.createLinearGradient(0, 0, 1080, 1080);
    grd.addColorStop(0, "#FFD9A0");
    grd.addColorStop(0.5, "#FF9E80");
    grd.addColorStop(1, "#8EC5FC");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.font = "900 160px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🌊", 540, 560);
    const img = new Image();
    img.onload = () => startWithImage(img);
    img.src = c.toDataURL("image/png");
  }

  function setMode(n) {
    mode = n;
    document.querySelectorAll("#gridModeRow .segment").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.mode) === n);
    });
    build();
  }

  function build() {
    if (!img) return;
    const n = mode;
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    const cell = side / n;

    // 生成每格图片
    pieces.forEach((p) => URL.revokeObjectURL(p.url));
    pieces = [];
    els.preview.innerHTML = "";
    els.preview.style.gridTemplateColumns = "repeat(" + n + ", 1fr)";

    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const c = document.createElement("canvas");
        c.width = 720;
        c.height = 720;
        const ctx = c.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, sx + col * cell, sy + row * cell, cell, cell, 0, 0, 720, 720);
        const url = c.toDataURL("image/png");
        const piece = { url };
        pieces.push(piece);

        const im = document.createElement("img");
        im.src = url;
        im.alt = "第" + (row * n + col + 1) + "格";
        im.addEventListener("click", () => {
          const a = document.createElement("a");
          a.href = url;
          a.download = "grid-" + (row * n + col + 1) + ".png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          T.toast("已下载第 " + (row * n + col + 1) + " 张");
        });
        els.preview.appendChild(im);
      }
    }

    els.saveAll.textContent = "依次下载全部（" + (n * n) + " 张）";
  }

  els.uploadBtn.addEventListener("click", () => els.input.click());
  els.input.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      startWithImage(await T.loadImage(file));
    } catch (err) {
      T.toast(err.message || "图片加载失败");
    }
  });

  els.modeRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".segment");
    if (btn) setMode(Number(btn.dataset.mode));
  });

  els.saveAll.addEventListener("click", () => {
    if (!pieces.length) return;
    T.toast("开始下载，浏览器可能提示允许下载多个文件");
    pieces.forEach((p, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = p.url;
        a.download = "grid-" + (i + 1) + ".png";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, i * 350);
    });
  });

  if (location.search.indexOf("demo") !== -1) {
    makeDemoImage();
  }
})();
