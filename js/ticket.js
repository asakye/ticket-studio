(function () {
  "use strict";

  const CFG = window.TT_CONFIG;
  const T = window.TT;

  // ============================================================
  // 模板定义（每款是一个纯函数：按比例在任意画布尺寸上绘制）
  // d = { city, country, date, no, note }
  // p = 从照片提取的主色调对象
  // ============================================================
  const TEMPLATES = [
    {
      id: "classic",
      name: "经典横版",
      free: true,
      ratio: 900 / 470,
      draw(ctx, W, H, img, d, p) {
        const bg = "#FFFDF8";
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 外框
        ctx.strokeStyle = "rgba(31,41,55,.85)";
        ctx.lineWidth = Math.max(1.5, W * 0.004);
        ctx.strokeRect(W * 0.02, H * 0.045, W * 0.96, H * 0.91);

        // 左侧照片
        const px = W * 0.055, py = H * 0.1, pw = W * 0.33, ph = H * 0.8;
        T.roundRect(ctx, px, py, pw, ph, 6);
        ctx.save();
        ctx.clip();
        T.drawCover(ctx, img, px, py, pw, ph);
        ctx.restore();

        // 照片旁主色竖条
        ctx.fillStyle = p.dark;
        ctx.fillRect(px + pw + W * 0.018, py, Math.max(3, W * 0.006), ph);

        // 右侧信息
        const tx = px + pw + W * 0.05;
        const tw = W - tx - W * 0.07;
        ctx.fillStyle = "#9AA1AB";
        ctx.font = "600 " + Math.round(W * 0.022) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText("ADMIT ONE · 单程票", tx, py + H * 0.06);

        // 城市（自适应字号，最多两行）
        const city = d.city || "未知目的地";
        let fs = Math.round(W * 0.088);
        ctx.font = "800 " + fs + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        while (ctx.measureText(city).width > tw && fs > 18) {
          fs -= 2;
          ctx.font = "800 " + fs + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        }
        ctx.fillStyle = "#1F2937";
        ctx.fillText(city, tx, py + H * 0.24);

        if (d.country) {
          ctx.font = "600 " + Math.round(W * 0.026) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.fillStyle = "#6B7280";
          ctx.fillText(d.country, tx, py + H * 0.36);
        }

        // 虚线分隔
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "#D1D5DB";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, py + H * 0.48);
        ctx.lineTo(tx + tw * 0.88, py + H * 0.48);
        ctx.stroke();
        ctx.restore();

        // 日期 + 编号
        ctx.fillStyle = "#1F2937";
        ctx.font = "700 " + Math.round(W * 0.036) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText(d.date || "2026.01.01", tx, py + H * 0.62);
        ctx.fillStyle = "#9AA1AB";
        ctx.font = "600 " + Math.round(W * 0.024) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText(d.no || "NO.000", tx, py + H * 0.72);

        // 备注
        if (d.note) {
          ctx.fillStyle = "#4B5563";
          ctx.font = "500 " + Math.round(W * 0.024) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.fillText(d.note.slice(0, 26), tx, py + H * 0.86);
        }

        // 打孔圆点
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(W * 0.02, H * 0.5, H * 0.035, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(W * 0.98, H * 0.5, H * 0.035, 0, Math.PI * 2);
        ctx.fill();
      },
    },
    {
      id: "minimal",
      name: "极简横版",
      free: true,
      ratio: 900 / 470,
      draw(ctx, W, H, img, d, p) {
        ctx.fillStyle = "#1F2937";
        ctx.fillRect(0, 0, W, H);

        // 上方大图
        const imgH = H * 0.62;
        ctx.save();
        T.roundRect(ctx, W * 0.03, H * 0.035, W * 0.94, imgH, 10);
        ctx.clip();
        T.drawCover(ctx, img, W * 0.03, H * 0.035, W * 0.94, imgH);
        ctx.restore();

        // 信息条
        const iy = H * 0.7;
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "800 " + Math.round(W * 0.055) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText(d.city || "未知目的地", W * 0.055, iy + H * 0.045);

        ctx.fillStyle = "rgba(255,255,255,.62)";
        ctx.font = "600 " + Math.round(W * 0.026) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        let sub = [d.country, d.date].filter(Boolean).join(" · ");
        if (d.no) sub = (sub ? sub + " · " : "") + d.no;
        ctx.fillText(sub || "TRAVEL MEMORY", W * 0.055, iy + H * 0.16);

        if (d.note) {
          ctx.fillStyle = "rgba(255,255,255,.45)";
          ctx.font = "500 " + Math.round(W * 0.024) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.fillText(d.note.slice(0, 40), W * 0.055, iy + H * 0.25);
        }

        // 主色小方块点缀
        ctx.fillStyle = p.rgb;
        ctx.fillRect(W * 0.055, iy - H * 0.09, W * 0.018, H * 0.045);
      },
    },
    {
      id: "film",
      name: "胶片横版",
      free: false,
      ratio: 900 / 470,
      draw(ctx, W, H, img, d, p) {
        // 黑色胶片带
        ctx.fillStyle = "#17181C";
        ctx.fillRect(0, 0, W, H);

        // 上下齿孔
        const holeR = H * 0.028;
        const holeGap = W * 0.075;
        ctx.fillStyle = "#2A2B30";
        for (let x = W * 0.045; x < W - W * 0.02; x += holeGap) {
          ctx.beginPath();
          ctx.arc(x, H * 0.055, holeR, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, H * 0.945, holeR, 0, Math.PI * 2);
          ctx.fill();
        }

        // 中间照片
        const px = W * 0.025, py = H * 0.115, pw = W * 0.95, ph = H * 0.63;
        ctx.fillStyle = "#000";
        ctx.fillRect(px, py, pw, ph);
        T.drawCover(ctx, img, px, py, pw, ph);

        // 底部白条：城市 + 日期戳
        ctx.fillStyle = "#F5F2EA";
        ctx.fillRect(0, H * 0.765, W, H * 0.235);

        ctx.fillStyle = "#1F2937";
        ctx.font = "800 " + Math.round(W * 0.045) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText(d.city || "未知目的地", W * 0.05, H * 0.87);

        ctx.fillStyle = "#9AA1AB";
        ctx.font = "600 " + Math.round(W * 0.024) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText([d.country, d.no].filter(Boolean).join(" · ") || "TRAVEL FILM", W * 0.05, H * 0.94);

        // 红色日期戳
        ctx.save();
        ctx.translate(W * 0.82, H * 0.87);
        ctx.rotate(-0.06);
        ctx.strokeStyle = "#D64545";
        ctx.lineWidth = Math.max(1.5, W * 0.004);
        ctx.font = "700 " + Math.round(W * 0.03) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.strokeText(d.date || "2026.01.01", 0, 0);
        ctx.restore();
      },
    },
    {
      id: "passport",
      name: "护照竖版",
      free: false,
      ratio: 620 / 820,
      draw(ctx, W, H, img, d, p) {
        const bg = "#FAF7F0";
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 封面式顶部
        ctx.fillStyle = p.dark;
        T.roundRect(ctx, W * 0.05, H * 0.04, W * 0.9, H * 0.13, 8);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 " + Math.round(W * 0.035) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText("PASSPORT TO", W * 0.09, H * 0.105);
        ctx.font = "800 " + Math.round(W * 0.06) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText(d.city || "未知目的地", W * 0.09, H * 0.145);

        // 中间照片（带白边，像证件照）
        const pw = W * 0.74, ph = H * 0.42;
        const px = (W - pw) / 2, py = H * 0.23;
        ctx.fillStyle = "#FFFFFF";
        T.roundRect(ctx, px - W * 0.02, py - H * 0.012, pw + W * 0.04, ph + H * 0.024, 4);
        ctx.fill();
        ctx.save();
        T.roundRect(ctx, px, py, pw, ph, 2);
        ctx.clip();
        T.drawCover(ctx, img, px, py, pw, ph);
        ctx.restore();

        // 信息区
        const iy = H * 0.7;
        const label = (t, v, y) => {
          ctx.fillStyle = "#B8B2A6";
          ctx.font = "600 " + Math.round(W * 0.024) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.fillText(t, W * 0.13, y);
          ctx.fillStyle = "#1F2937";
          ctx.font = "700 " + Math.round(W * 0.034) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.fillText(v || "—", W * 0.13, y + H * 0.028);
        };
        label("COUNTRY / 国家地区", d.country, iy);
        label("DATE / 日期", d.date, iy + H * 0.075);
        label("NO. / 编号", d.no, iy + H * 0.15);

        if (d.note) {
          ctx.fillStyle = "#6B7280";
          ctx.font = "500 " + Math.round(W * 0.026) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
          ctx.fillText(d.note.slice(0, 30), W * 0.13, H * 0.93);
        }
      },
    },
    {
      id: "cinema",
      name: "电影票竖版",
      free: false,
      ratio: 620 / 820,
      draw(ctx, W, H, img, d, p) {
        // 背景渐变（取照片主色）
        ctx.fillStyle = p.light;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFFFFF";
        T.roundRect(ctx, W * 0.06, H * 0.03, W * 0.88, H * 0.94, 14);
        ctx.fill();

        // 顶部影院名
        ctx.fillStyle = p.dark;
        ctx.font = "800 " + Math.round(W * 0.042) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText("TRAVEL CINEMA", W * 0.12, H * 0.08);
        ctx.fillStyle = "#9AA1AB";
        ctx.font = "600 " + Math.round(W * 0.024) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText("旅行正在上映", W * 0.12, H * 0.105);

        // 照片（圆角）
        const pw = W * 0.76, ph = H * 0.4;
        const px = (W - pw) / 2, py = H * 0.15;
        ctx.save();
        T.roundRect(ctx, px, py, pw, ph, 10);
        ctx.clip();
        T.drawCover(ctx, img, px, py, pw, ph);
        ctx.restore();

        // 片名
        const title = d.city || "未知目的地";
        let fs = Math.round(W * 0.075);
        ctx.font = "800 " + fs + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        while (ctx.measureText(title).width > W * 0.76 && fs > 20) {
          fs -= 2;
          ctx.font = "800 " + fs + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        }
        ctx.fillStyle = "#1F2937";
        ctx.fillText(title, px, H * 0.63);

        // 虚线副券分隔
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "#D1D5DB";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, H * 0.68);
        ctx.lineTo(px + pw, H * 0.68);
        ctx.stroke();
        ctx.restore();

        // 副券信息
        ctx.fillStyle = "#6B7280";
        ctx.font = "600 " + Math.round(W * 0.027) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText("日期  " + (d.date || "2026.01.01"), px, H * 0.745);
        ctx.fillText("座位  " + (d.no || "01A"), px, H * 0.8);
        ctx.fillText("备注  " + (d.note ? d.note.slice(0, 18) : "—"), px, H * 0.855);

        // 底部打孔
        ctx.fillStyle = p.light;
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.905, H * 0.022, 0, Math.PI * 2);
        ctx.fill();
      },
    },
  ];

  // ============================================================
  // 状态
  // ============================================================
  const state = {
    img: null,
    palette: null,
    templateId: "classic",
    city: "",
    country: "",
    date: "",
    no: "",
    note: "",
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    uploadCard: $("uploadCard"),
    editorCard: $("editorCard"),
    photoInput: $("photoInput"),
    uploadBtn: $("uploadBtn"),
    canvas: $("previewCanvas"),
    templateRow: $("templateRow"),
    templateLockHint: $("templateLockHint"),
    cityInput: $("cityInput"),
    countryInput: $("countryInput"),
    dateInput: $("dateInput"),
    noInput: $("noInput"),
    noteInput: $("noteInput"),
    exportBtn: $("exportBtn"),
    shareBtn: $("shareBtn"),
    unlockBtn: $("unlockBtn"),
    watermarkNote: $("watermarkNote"),
    unlockModal: $("unlockModal"),
    unlockMask: $("unlockMask"),
    unlockClose: $("unlockClose"),
    codeInput: $("codeInput"),
    codeSubmit: $("codeSubmit"),
    unlockStatus: $("unlockStatus"),
    qrBox: $("qrBox"),
    proTemplateCount: $("proTemplateCount"),
  };

  // ============================================================
  // 图片加载入口
  // ============================================================
  function startWithImage(img) {
    state.img = img;
    state.palette = T.paletteFromImage(img);
    if (!state.date) state.date = today();
    els.uploadCard.hidden = true;
    els.editorCard.hidden = false;
    renderThumbnails();
    renderPreview();
    updateWatermarkNote();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 演示模式：?demo 时自动生成一张示例风景图
  function makeDemoImage() {
    const c = document.createElement("canvas");
    c.width = 900;
    c.height = 1200;
    const ctx = c.getContext("2d");
    const grd = ctx.createLinearGradient(0, 0, 0, 1200);
    grd.addColorStop(0, "#FFD9A0");
    grd.addColorStop(0.55, "#FF9E80");
    grd.addColorStop(1, "#5D8BD4");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 900, 1200);

    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.beginPath();
    ctx.arc(680, 300, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4A6FA5";
    ctx.beginPath();
    ctx.moveTo(0, 900);
    ctx.lineTo(300, 520);
    ctx.lineTo(560, 900);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#39597F";
    ctx.beginPath();
    ctx.moveTo(260, 900);
    ctx.lineTo(640, 480);
    ctx.lineTo(900, 760);
    ctx.lineTo(900, 900);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.fillRect(0, 800, 900, 400);

    const img = new Image();
    img.onload = () => startWithImage(img);
    img.src = c.toDataURL("image/png");
  }

  // ============================================================
  // 模板渲染
  // ============================================================
  function currentTemplate() {
    return TEMPLATES.find((t) => t.id === state.templateId) || TEMPLATES[0];
  }

  function render(canvas, template, scale) {
    const W = Math.round(900 * scale);
    const H = Math.round(900 / template.ratio * scale);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    ctx.scale(scale, scale);
    template.draw(ctx, 900, 900 / template.ratio, state.img, {
      city: state.city,
      country: state.country,
      date: state.date,
      no: state.no,
      note: state.note,
    }, state.palette);
    ctx.restore();

    // 免费版水印
    if (!T.isPro()) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.font = "600 " + Math.round(900 * 0.014 * scale) + "px 'PingFang SC','Microsoft YaHei',sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0,0,0,.6)";
      ctx.shadowBlur = 4;
      ctx.fillText(CFG.watermarkText, canvas.width - ctx.measureText(CFG.watermarkText).width - 24 * scale, canvas.height - 18 * scale);
      ctx.restore();
    }
  }

  function renderPreview() {
    if (!state.img) return;
    render(els.canvas, currentTemplate(), 1.5);
  }

  function renderThumbnails() {
    els.templateRow.innerHTML = "";
    TEMPLATES.forEach((t) => {
      const item = document.createElement("div");
      item.className = "template-item" + (t.id === state.templateId ? " active" : "") + (t.free ? "" : " locked");
      const c = document.createElement("canvas");
      c.width = 184;
      c.height = Math.round(184 / t.ratio);
      const ctx = c.getContext("2d");
      t.draw(ctx, 184, 184 / t.ratio, state.img, {
        city: state.city || "大理",
        country: state.country || "中国",
        date: state.date || "2026.08.06",
        no: state.no || "NO.001",
        note: state.note || "风很大，海很蓝",
      }, state.palette || { rgb: "#FF6B4A", dark: "#C2442A", light: "#FFD9CE", onDark: "#FFFFFF" });
      const span = document.createElement("span");
      span.textContent = (t.free ? "" : "🔒 ") + t.name;
      item.appendChild(c);
      item.appendChild(span);
      item.addEventListener("click", () => selectTemplate(t));
      els.templateRow.appendChild(item);
    });
  }

  function selectTemplate(t) {
    if (!t.free && !T.isPro()) {
      T.toast("这是高级模板，解锁后可用");
      openUnlock();
      return;
    }
    state.templateId = t.id;
    renderThumbnails();
    renderPreview();
  }

  // ============================================================
  // 导出
  // ============================================================
  async function exportImage() {
    if (!state.img) return;
    const pro = T.isPro();
    const scale = pro ? CFG.proScale : CFG.freeScale;
    render(els.canvas, currentTemplate(), scale);
    const blob = await T.canvasToBlob(els.canvas, "image/png");
    state.lastBlob = blob;
    const city = state.city.replace(/[\\/:*?"<>|]/g, "") || "travel";
    const date = (state.date || "ticket").replace(/[\\/:*?"<>|]/g, "").replace(/\./g, "-");
    T.downloadBlob(blob, "票根-" + city + "-" + date + ".png");
    if (!pro) T.toast("已保存（免费版含小水印），解锁可去水印");
    renderPreview();
  }

  async function shareImage() {
    if (!state.lastBlob) {
      T.toast("请先点「保存高清图片」生成作品");
      return;
    }
    const fileName = "票根-" + (state.city || "travel") + ".png";
    const shareData = {
      title: "票根工坊",
      text: "把旅行变成一张票根 🎫 " + (state.city || ""),
      files: [new File([state.lastBlob], fileName, { type: "image/png" })],
    };
    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }
    // 不支持文件分享时，退化为复制页面链接
    const url = location.href.split("?")[0];
    try {
      await navigator.clipboard.writeText(url);
      T.toast("链接已复制，去粘贴给朋友吧");
    } catch (e) {
      T.toast("分享失败，请直接保存图片发送");
    }
  }

  // ============================================================
  // 解锁
  // ============================================================
  function openUnlock() {
    els.unlockModal.hidden = false;
    els.unlockStatus.textContent = "";
    // 尝试加载收款码
    const img = new Image();
    img.onload = () => {
      els.qrBox.innerHTML = "";
      els.qrBox.appendChild(img);
    };
    img.onerror = () => {
      els.qrBox.innerHTML = "<span>收款码占位<br>（把收款码图片放到 assets/pay-qr.png 即可自动显示）</span>";
    };
    img.src = CFG.qrImage;
  }

  function closeUnlock() {
    els.unlockModal.hidden = true;
  }

  function activateCode(code) {
    const hit = (CFG.licenseCodes || []).some((c) => c.toLowerCase() === code.trim().toLowerCase());
    if (!hit) {
      els.unlockStatus.textContent = "解锁码无效，请检查后重试";
      return;
    }
    T.setPro(true);
    els.unlockStatus.textContent = "✅ 解锁成功！高级模板已开启";
    setTimeout(() => {
      closeUnlock();
      renderThumbnails();
      renderPreview();
      updateWatermarkNote();
    }, 900);
  }

  function updateWatermarkNote() {
    if (T.isPro()) {
      els.watermarkNote.textContent = "已解锁：全部模板 + 3 倍高清无水印";
      els.unlockBtn.textContent = "✅ 已解锁";
      els.unlockBtn.disabled = true;
      els.unlockBtn.style.opacity = 0.6;
      els.templateLockHint.hidden = true;
    } else {
      els.watermarkNote.textContent = "免费版导出 2 倍清晰度并带小水印，解锁后 3 倍高清无水印";
    }
  }

  // ============================================================
  // 事件绑定
  // ============================================================
  function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "." + p(d.getMonth() + 1) + "." + p(d.getDate());
  }

  els.uploadBtn.addEventListener("click", () => els.photoInput.click());
  els.photoInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      startWithImage(await T.loadImage(file));
    } catch (err) {
      T.toast(err.message || "图片加载失败");
    }
  });

  ["cityInput", "countryInput", "dateInput", "noInput", "noteInput"].forEach((key) => {
    els[key].addEventListener("input", () => {
      state[key.replace("Input", "")] = els[key].value.trim();
      renderPreview();
    });
  });

  els.exportBtn.addEventListener("click", exportImage);
  els.shareBtn.addEventListener("click", shareImage);
  els.unlockBtn.addEventListener("click", openUnlock);
  els.unlockClose.addEventListener("click", closeUnlock);
  els.unlockMask.addEventListener("click", closeUnlock);
  els.codeSubmit.addEventListener("click", () => activateCode(els.codeInput.value));
  els.codeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") activateCode(els.codeInput.value);
  });

  els.proTemplateCount.textContent = TEMPLATES.filter((t) => !t.free).length;
  updateWatermarkNote();

  if (location.search.indexOf("demo") !== -1) {
    state.city = "大理";
    state.country = "中国";
    state.no = "NO.001";
    state.note = "风很大，海很蓝，下次还来。";
    els.cityInput.value = state.city;
    els.countryInput.value = state.country;
    els.noInput.value = state.no;
    els.noteInput.value = state.note;
    makeDemoImage();
  }
})();
