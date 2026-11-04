// Tạo lại các mẫu Word nhân sự (Hợp đồng lao động, Thư mời nhận việc, Quyết định thôi việc) song ngữ Việt – Anh, giấy tiêu đề Viora.
// Chạy: node hanh-chinh-van-hanh/_cong-cu/tao-mau-van-ban.js   (cần thư viện npm "docx")
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, Header, Footer, PageNumber, ShadingType, VerticalAlign, TableLayoutType, Tab, TabStopType,
  HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType,
} = require('docx');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'hanh-chinh-van-hanh/nhan-su');
// Logo gốc: biểu tượng hoa sen + chữ VIORA LIVING SAIGON (ghép từ public/brand/mark.png + wordmark.png)
const LOGO = fs.readFileSync(path.join(__dirname, 'logo-letterhead.png'));
// Dải nền tràn trang cho đầu / chân trang (vẽ sẵn ở 300 dpi)
const HEADER_BG = fs.readFileSync(path.join(__dirname, 'header-bg.png'));
const FOOTER_BG = fs.readFileSync(path.join(__dirname, 'footer-bg.png'));
const EMU_CM = 360000;

// ---------- Thông tin pháp nhân (Giấy CN ĐKDN) ----------
const CO = {
  vi: 'CÔNG TY CỔ PHẦN VIORA LIVING SAIGON', en: 'VIORA LIVING SAIGON CORPORATION',
  mst: '3703493386',
  addrVi: 'A147F Khu phố Bình Đức 2, Phường Lái Thiêu, Thành phố Hồ Chí Minh, Việt Nam',
  addrEn: 'A147F Binh Duc 2 Quarter, Lai Thieu Ward, Ho Chi Minh City, Vietnam',
  addrShort: 'A147F KP. Bình Đức 2, P. Lái Thiêu, TP.HCM',
  phone: '0868 120 165', email: 'contact@vioraliving.com.vn',
  rep: 'NGUYỄN THẾ VŨ', repVi: 'Giám đốc', repEn: 'Director',
  hrPhone: '0708 2999 07', hrEmail: 'hr@vioraliving.com.vn', web: 'vioraliving.com.vn', // 0868 120 165 = hotline công ty · 0708 2999 07 = số tuyển dụng (HR)
  siteVi: 'Viora Living Saigon – Cơ sở Lái Thiêu, Khu phố Bình Đức 2, Phường Lái Thiêu, TP.HCM',
  siteEn: 'Viora Living Saigon – Lai Thieu Campus, Binh Duc 2 Quarter, Lai Thieu Ward, Ho Chi Minh City',
};

// ---------- Thiết kế ----------
const TEAL = '127884', DARK = '0B4A54', GOLD = 'C9952B', INK = '1F2A2C', GREY = '6B7778', LINE = 'DCD5C8', TINT = 'EEF6F5';
const FONT = 'Times New Roman';
const PAGE_W = 11906, MARGIN = 1247;                  // A4, lề 2,2 cm
const W = PAGE_W - 2 * MARGIN;                         // bề rộng nội dung
const SZ = 23, SZ_EN = 20;                             // 11,5pt tiếng Việt · 10pt tiếng Anh
const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NONE = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

const t = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size ?? SZ, bold: o.b, italics: o.i, color: o.c ?? INK, characterSpacing: o.sp, break: o.br });
const tab = (o = {}) => new TextRun({ children: [new Tab()], font: FONT, size: o.size ?? SZ });
const P = (children, o = {}) => new Paragraph({
  children, alignment: o.al, keepNext: o.kn, keepLines: true, indent: o.ind, tabStops: o.tabs, border: o.bd, shading: o.sh,
  spacing: { before: o.bf ?? 0, after: o.af ?? 60, line: o.ln ?? 264 },
});
const VI = (text, o = {}) => P([t(text, o)], { al: AlignmentType.JUSTIFIED, af: 0, ...o });
const EN = (text, o = {}) => P([t(text, { i: true, c: GREY, size: SZ_EN, b: o.b })], { al: AlignmentType.JUSTIFIED, af: 100, ...o });
const gap = (h = 120, kn) => P([], { af: h, kn });

// Dòng điền thông tin có chấm dẫn:  Nhãn / Label: ........................
// fields: [[vi, en], [vi, en]] → 1 hoặc 2 ô trên một dòng
function fill(fields, o = {}) {
  if (fields.length === 2) {
    const cw = Math.round(W / 2);
    const cell = ([v, e], w, pad) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: NONE, margins: { left: pad ? 160 : 0, right: 0, top: 0, bottom: 0 }, children: [
      P([t(v, { b: true }), t(` / ${e}`, { i: true, c: GREY, size: SZ_EN }), t(': '), tab()], { tabs: [{ type: TabStopType.RIGHT, position: w - (pad ? 180 : 40), leader: 'dot' }], af: 110 })] });
    return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [cw, W - cw], borders: NONE, layout: TableLayoutType.FIXED,
      rows: [new TableRow({ cantSplit: true, children: [cell(fields[0], cw, false), cell(fields[1], W - cw, true)] })] });
  }
  const half = Math.round(W / 2) - 120;
  const children = [];
  fields.forEach(([v, e], i) => {
    if (i) children.push(t('   '));
    children.push(t(v, { b: true }), t(` / ${e}`, { i: true, c: GREY, size: SZ_EN }), t(': '), tab());
  });
  const stops = fields.length === 2
    ? [{ type: TabStopType.RIGHT, position: half, leader: 'dot' }, { type: TabStopType.RIGHT, position: W, leader: 'dot' }]
    : [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }];
  return P(children, { tabs: stops, af: 110, ind: o.ind });
}

// Tiêu đề điều khoản: thanh màu nhạt + vạch xanh bên trái
const ART = (no, vi, en) => P([
  t(`ĐIỀU ${no}. `, { b: true, c: TEAL, size: 22 }), t(vi.toUpperCase(), { b: true, c: DARK, size: 22 }),
  t(`Article ${no}. ${en}`, { i: true, c: GREY, size: 19, br: 1 }),
], { kn: true, bf: 220, af: 120, sh: { type: ShadingType.CLEAR, color: 'auto', fill: TINT },
  bd: { left: { style: BorderStyle.SINGLE, size: 24, color: TEAL, space: 6 } }, ind: { left: 120 } });

// Mục đánh số song ngữ: số ở lề, VI rồi EN thụt cùng mức
const ITEM = (n, vi, en, keep) => [
  P([t(`${n}`, { b: true, c: TEAL }), tab(), t(vi)], { al: AlignmentType.JUSTIFIED, af: 20, ind: { left: 400, hanging: 400 }, tabs: [{ type: TabStopType.LEFT, position: 400 }], kn: true }),
  P([t(en, { i: true, c: GREY, size: SZ_EN })], { al: AlignmentType.JUSTIFIED, af: 110, ind: { left: 400 }, kn: keep }),
];
const SUB = (vi, en) => [
  P([t(vi)], { af: 0, ind: { left: 800 }, kn: true }),
  P([t(en, { i: true, c: GREY, size: SZ_EN })], { af: 80, ind: { left: 800 } }),
];

// ---------- Giấy tiêu đề ----------
// Ảnh nền nằm sau chữ, neo theo mép trang (tràn hết chiều ngang)
const bandImage = (data, hCm, topCm) => new ImageRun({ type: 'png', data,
  transformation: { width: 794, height: Math.round(hCm / 2.54 * 96) },
  floating: { zIndex: 1, horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
    verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: Math.round(topCm * EMU_CM) },
    behindDocument: true, allowOverlap: true, wrap: { type: TextWrappingType.NONE } } });

// Hoa văn (sóng, vạch, icon) là ảnh nền 300 dpi vẽ bằng tao-nen-tieu-de.py; logo là ảnh 600 dpi
// cắt từ file logo gốc; còn TOÀN BỘ CHỮ là chữ Word thật → in ra sắc nét.
const HEADER_H = 4.28, FOOTER_H = 3.18;
const U_CM = 21 / 1055; // 1 đơn vị bản phác thảo (cm)
const cmTw = (v) => Math.round(v / 2.54 * 1440);
const MARGIN_CM = MARGIN / 1440 * 2.54;
const floatAt = (data, xCm, yCm, wCm, hCm) => new ImageRun({ type: 'png', data,
  transformation: { width: Math.round(wCm / 2.54 * 96), height: Math.round(hCm / 2.54 * 96) },
  floating: { zIndex: 2, horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: Math.round(xCm * EMU_CM) },
    verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: Math.round(yCm * EMU_CM) },
    behindDocument: true, allowOverlap: true, wrap: { type: TextWrappingType.NONE } } });
const HTXT = 'FFFFFF', HGOLD = 'F6CD70', HINK = '0C343A', HINK2 = '1C484E';
function header() {
  const ind = { left: cmTw(530 * U_CM - MARGIN_CM) };
  const line = (children, o = {}) => new Paragraph({ indent: ind, spacing: { before: o.bf ?? 0, after: 0, line: o.ln ?? 270, lineRule: 'exact' }, children });
  return new Header({ children: [
    line([bandImage(HEADER_BG, HEADER_H, 0),
      t(CO.vi, { b: true, c: HINK, size: 19 })], { bf: HDR_BEFORE }),
    line([t(CO.en.toUpperCase(), { c: TEAL, size: 15, sp: 12 })]),
    line([t(`MSDN ${CO.mst}`, { c: HINK2, size: 15 }), t('   |   ', { c: GOLD, size: 15 }), t(CO.addrShort, { c: HINK2, size: 15 })], { ln: 290 }),
  ] });
}
function footer() {
  const tabs = [372, 604, 880].map((x) => ({ type: TabStopType.LEFT, position: cmTw(x * U_CM - MARGIN_CM) }));
  return new Footer({ children: [
    // Số trang: phía trên dải màu, bên trái (nền trắng)
    new Paragraph({ style: 'VLFooter', spacing: { before: 0, after: FTR_GAP, line: 240, lineRule: 'exact' }, run: { font: FONT, size: 16, color: DARK }, children: [
      bandImage(FOOTER_BG, FOOTER_H, 29.7 - FOOTER_H),
      t('Trang ', { c: HINK, size: 16 }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, bold: true, color: DARK }),
      t(' / ', { c: HINK, size: 16 }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: DARK }),
    ] }),
    // Dòng liên hệ: chữ trắng trên dải xanh đậm, canh theo icon vẽ sẵn
    new Paragraph({ indent: { left: cmTw(86 * U_CM - MARGIN_CM), right: -cmTw(2.0) }, tabStops: tabs, spacing: { before: 0, after: 0, line: 240, lineRule: 'exact' }, children: [
      t('Where Aging Becomes Living', { i: true, c: HGOLD, size: 17 }), tab({ size: 17 }),
      t('Hotline ' + CO.phone, { b: true, c: HTXT, size: 17 }), tab({ size: 17 }),
      t(CO.email, { c: HTXT, size: 17 }), tab({ size: 17 }),
      t(CO.web, { c: HTXT, size: 17 }),
    ] }),
  ] });
}
const HDR_BEFORE = 330, FTR_GAP = 420;
const doc = (title, children) => new Document({
  creator: 'Viora Living Saigon', title,
  styles: { default: { document: { run: { font: FONT, size: SZ, color: INK } } },
    paragraphStyles: [{ id: 'VLFooter', name: 'VL Footer', run: { font: FONT, size: 16, color: DARK } }] },
  sections: [{ properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 2610, bottom: 1650, left: MARGIN, right: MARGIN, header: 200, footer: 470 } } },
    headers: { default: header() }, footers: { default: footer() }, children }],
});

// Tiêu đề văn bản: tên VN lớn, EN nhỏ, vạch vàng ngắn
const TITLE = (vi, en, sub) => [
  P([t(vi, { b: true, size: 34, c: DARK, sp: 10 })], { al: AlignmentType.CENTER, af: 0, bf: 120 }),
  P([t(en, { i: true, size: 22, c: GREY, sp: 20 })], { al: AlignmentType.CENTER, af: 60 }),
  P([t('━━━━', { c: GOLD, size: 18 })], { al: AlignmentType.CENTER, af: sub ? 60 : 240 }),
  ...(sub ? [P([t(sub, { size: 21, c: GREY })], { al: AlignmentType.CENTER, af: 240 })] : []),
];

// Khối chữ ký 2 cột
function signatures(left, right) {
  const half = Math.round(W / 2);
  const col = ([v, e, note, name, title]) => new TableCell({ width: { size: half, type: WidthType.DXA }, borders: NONE, children: [
    P([t(v, { b: true, c: DARK })], { al: AlignmentType.CENTER, af: 0 }),
    P([t(e, { i: true, c: GREY, size: SZ_EN })], { al: AlignmentType.CENTER, af: 0 }),
    P([t(note, { i: true, c: GREY, size: 17 })], { al: AlignmentType.CENTER, af: 1300 }),
    P([t(name, { b: true })], { al: AlignmentType.CENTER, af: 0 }),
    ...(title ? [P([t(title, { c: GREY, size: 19 })], { al: AlignmentType.CENTER, af: 0 })] : []),
  ] });
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [half, W - half], borders: NONE, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ cantSplit: true, children: [col(left), col(right)] })] });
}

// =====================================================================
// 1) HỢP ĐỒNG LAO ĐỘNG
// =====================================================================
function contract() {
  const party = (vi, en) => P([t(vi, { b: true, c: TEAL, size: 22, sp: 6 }), t(`  ·  ${en}`, { i: true, c: GREY, size: 19 })],
    { kn: true, bf: 200, af: 120, bd: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 3 } } });
  const known = (v, e, val) => P([t(v, { b: true }), t(` / ${e}`, { i: true, c: GREY, size: SZ_EN }), t(':  '), t(val)], { af: 90 });

  const c = [
    P([t('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { b: true, size: 23 })], { al: AlignmentType.CENTER, af: 0 }),
    P([t('Độc lập – Tự do – Hạnh phúc', { b: true, size: 23 })], { al: AlignmentType.CENTER, af: 0 }),
    P([t('Socialist Republic of Vietnam  ·  Independence – Freedom – Happiness', { i: true, c: GREY, size: 18 })], { al: AlignmentType.CENTER, af: 120 }),
    ...TITLE('HỢP ĐỒNG LAO ĐỘNG', 'LABOUR CONTRACT', 'Số / No.:  .......... /HĐLĐ-VLS'),

    VI('Căn cứ Bộ luật Lao động số 45/2019/QH14 ngày 20/11/2019 và các văn bản hướng dẫn thi hành; căn cứ nhu cầu và năng lực của hai bên.', { i: true, size: 21 }),
    EN('Pursuant to Labour Code No. 45/2019/QH14 dated 20 November 2019 and its guiding documents; based on the needs and capabilities of both parties.'),
    fill([['Hôm nay, ngày', 'Date']]),
    fill([['Tại', 'At']]),
    VI('Chúng tôi gồm:', { af: 0 }), EN('We are:'),

    party('BÊN A – NGƯỜI SỬ DỤNG LAO ĐỘNG', 'Party A – The Employer'),
    known('Tên công ty', 'Company', CO.vi),
    P([t(CO.en, { i: true, c: GREY, size: SZ_EN })], { af: 90, ind: { left: 0 } }),
    known('Mã số doanh nghiệp', 'Enterprise code', CO.mst),
    known('Địa chỉ', 'Address', CO.addrVi),
    known('Điện thoại', 'Tel', `${CO.phone}    Email: ${CO.email}`),
    known('Đại diện', 'Represented by', `Ông ${CO.rep} – ${CO.repVi} / Mr. ${CO.rep} – ${CO.repEn}`),

    party('BÊN B – NGƯỜI LAO ĐỘNG', 'Party B – The Employee'),
    fill([['Họ và tên', 'Full name']]),
    fill([['Ngày sinh', 'Date of birth'], ['Giới tính', 'Gender']]),
    fill([['Số CCCD / Hộ chiếu', 'ID / Passport No.'], ['Ngày cấp', 'Issued on']]),
    fill([['Nơi cấp', 'Place of issue'], ['Quốc tịch', 'Nationality']]),
    fill([['Nơi cư trú', 'Residence']]),
    fill([['Điện thoại', 'Phone'], ['Email', 'Email']]),
    fill([['Số tài khoản', 'Bank account'], ['Ngân hàng', 'Bank']]),
    gap(60),
    VI('Hai bên thỏa thuận ký kết hợp đồng lao động với các điều khoản sau:', { af: 0 }),
    EN('The two parties agree to enter into this labour contract on the following terms:'),

    ART(1, 'Loại hợp đồng, công việc, địa điểm', 'Contract type, job and place of work'),
    ...ITEM('1.', 'Loại hợp đồng:   ☐ Xác định thời hạn ....... tháng, từ ngày ............ đến ngày ............    ☐ Không xác định thời hạn, từ ngày ............',
      'Contract type:   ☐ Definite term of ....... months, from ............ to ............    ☐ Indefinite term, from ............'),
    ...ITEM('2.', 'Thử việc (nếu có): ....... ngày, từ ngày ............ đến ngày ............; lương thử việc ............ VNĐ (không thấp hơn 85% mức lương của công việc đó).',
      'Probation (if any): ....... days, from ............ to ............; probation salary VND ............ (not less than 85% of the salary for the job).'),
    ...ITEM('3.', 'Chức danh:   ☐ Điều dưỡng   ☐ Nhân viên chăm sóc người cao tuổi   ☐ Kỹ thuật viên Vật lý trị liệu, Phục hồi chức năng',
      'Position:   ☐ Nurse   ☐ Elderly Caregiver   ☐ Physiotherapy & Rehabilitation Technician'),
    ...ITEM('4.', 'Hình thức:   ☐ Toàn thời gian   ☐ Bán thời gian / cộng tác.    Quản lý trực tiếp: ...............................',
      'Employment type:   ☐ Full-time   ☐ Part-time / collaborator.    Direct manager: ...............................'),
    ...ITEM('5.', 'Nhiệm vụ: theo Bản mô tả công việc (Phụ lục 01) và phân công hợp lý của người quản lý.',
      'Duties: as set out in the Job Description (Appendix 01) and reasonable assignments by the manager.'),
    ...ITEM('6.', `Địa điểm làm việc: ${CO.siteVi}.`, `Place of work: ${CO.siteEn}.`),

    ART(2, 'Thời giờ làm việc, nghỉ ngơi', 'Working hours and rest'),
    ...ITEM('1.', 'Làm việc theo ca: ....... giờ/ngày, ....... giờ/tuần. Lịch ca do Bên A bố trí và thông báo trước ....... ngày.',
      'Shift work: ....... hours/day, ....... hours/week. The roster is set by Party A and notified ....... days in advance.'),
    ...ITEM('2.', 'Nghỉ trong ca, nghỉ hằng tuần, nghỉ lễ, Tết, nghỉ hằng năm (....... ngày/năm) và nghỉ việc riêng theo Bộ luật Lao động và nội quy của Bên A.',
      'Breaks, weekly rest, public holidays, Tet, annual leave (....... days/year) and personal leave in accordance with the Labour Code and Party A’s internal rules.'),
    ...ITEM('3.', 'Làm thêm giờ chỉ khi Bên B đồng ý và được trả lương theo quy định của pháp luật.',
      'Overtime only with Party B’s consent and paid in accordance with the law.'),

    ART(3, 'Tiền lương, phụ cấp và phúc lợi', 'Salary, allowances and benefits'),
    ...ITEM('1.', 'Mức lương: ............................ VNĐ / ☐ tháng  ☐ giờ.    Phụ cấp: ............................',
      'Salary: VND ............................ per ☐ month  ☐ hour.    Allowances: ............................'),
    ...ITEM('2.', 'Trả lương bằng chuyển khoản vào ngày ....... hằng tháng. Nâng lương, thưởng theo quy chế của Bên A.',
      'Paid by bank transfer on the ....... of each month. Salary review and bonuses follow Party A’s policy.'),
    ...ITEM('3.', 'Bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp theo quy định của pháp luật.',
      'Social, health and unemployment insurance in accordance with the law.'),
    ...ITEM('4.', 'Đào tạo: Bên B được đào tạo quy trình chăm sóc người cao tuổi và có thể được xét cử tham gia chương trình đào tạo chuyên môn tại Nhật Bản; chi phí ăn ở, đi lại do Bên A chi trả. Điều kiện và cam kết sau đào tạo (nếu có) quy định trong thỏa thuận đào tạo riêng.',
      'Training: Party B is trained in elderly-care procedures and may be selected for professional training in Japan; accommodation, meals and travel are paid by Party A. Conditions and post-training commitments (if any) are set out in a separate training agreement.'),
    ...ITEM('5.', 'Chỗ lưu trú tại Trung tâm:   ☐ Có nhu cầu   ☐ Không có nhu cầu.    Điều kiện: ............................',
      'On-site accommodation:   ☐ Required   ☐ Not required.    Terms: ............................'),
    ...ITEM('6.', 'Đồng phục, dụng cụ và trang bị bảo hộ lao động do Bên A cấp theo yêu cầu công việc.',
      'Uniforms, tools and protective equipment are provided by Party A as the job requires.'),

    ART(4, 'Quyền và nghĩa vụ của Bên B', 'Rights and obligations of Party B'),
    ...ITEM('1.', 'Được hưởng lương, phụ cấp, phúc lợi, đào tạo và các quyền khác theo hợp đồng này và pháp luật.',
      'To receive salary, allowances, benefits, training and other entitlements under this contract and the law.'),
    ...ITEM('2.', 'Hoàn thành công việc được giao; tuân thủ nội quy lao động, quy trình chuyên môn, an toàn – vệ sinh lao động và sự điều hành hợp pháp của Bên A.',
      'To perform the assigned work and comply with the internal rules, professional procedures, occupational safety and Party A’s lawful instructions.'),
    ...ITEM('3.', 'Tôn trọng phẩm giá, quyền riêng tư, an toàn của người cao tuổi; bảo mật thông tin sức khỏe, thông tin cá nhân của người cao tuổi, gia đình họ và thông tin nội bộ của Bên A, kể cả sau khi chấm dứt hợp đồng.',
      'To respect the dignity, privacy and safety of residents and keep confidential the health and personal information of residents, their families and Party A’s internal information, including after the contract ends.'),
    ...ITEM('4.', 'Bồi thường thiệt hại do lỗi của mình gây ra theo nội quy và quy định của pháp luật.',
      'To compensate for damage caused by their fault in accordance with the internal rules and the law.'),

    ART(5, 'Quyền và nghĩa vụ của Bên A', 'Rights and obligations of Party A'),
    ...ITEM('1.', 'Bảo đảm việc làm, điều kiện làm việc an toàn; trả lương đầy đủ, đúng hạn; đóng bảo hiểm theo quy định.',
      'To provide work and safe working conditions; pay salary in full and on time; pay insurance contributions as required.'),
    ...ITEM('2.', 'Điều hành, phân công công việc; khen thưởng và xử lý kỷ luật lao động theo nội quy và pháp luật.',
      'To manage and assign work; reward and discipline in accordance with the internal rules and the law.'),

    ART(6, 'Chấm dứt hợp đồng và dữ liệu cá nhân', 'Termination and personal data'),
    ...ITEM('1.', 'Hợp đồng chấm dứt trong các trường hợp, theo thủ tục và thời hạn báo trước quy định tại Bộ luật Lao động; hai bên thanh toán đầy đủ các khoản liên quan.',
      'This contract terminates in the cases, procedures and notice periods set out in the Labour Code; both parties settle all related payments.'),
    ...ITEM('2.', 'Bên B đồng ý để Bên A xử lý dữ liệu cá nhân của mình cho mục đích quản lý nhân sự, trả lương, bảo hiểm, thuế và các nghĩa vụ theo pháp luật.',
      'Party B consents to Party A processing their personal data for HR management, payroll, insurance, tax and legal obligations.'),

    ART(7, 'Điều khoản thi hành', 'Implementation'),
    ...ITEM('1.', 'Những vấn đề không ghi trong hợp đồng thực hiện theo nội quy lao động, thỏa ước lao động tập thể (nếu có) và pháp luật. Tranh chấp được giải quyết trước hết bằng thương lượng, nếu không thành thì theo quy định của pháp luật.',
      'Matters not covered follow the internal rules, the collective labour agreement (if any) and the law. Disputes are first settled by negotiation, failing which in accordance with the law.'),
    ...ITEM('2.', 'Hợp đồng lập thành 02 bản song ngữ có giá trị như nhau, mỗi bên giữ 01 bản; khi có khác biệt, bản tiếng Việt được ưu tiên áp dụng. Hợp đồng có hiệu lực từ ngày ............................',
      'Made in 02 bilingual originals of equal validity, one for each party; in case of discrepancy the Vietnamese version prevails. Effective from ............................', true),
    P([], { af: 200, kn: true }),
    signatures(['NGƯỜI LAO ĐỘNG', 'The Employee', '(Ký, ghi rõ họ tên / Signature, full name)', '.......................................'],
               ['NGƯỜI SỬ DỤNG LAO ĐỘNG', 'The Employer', '(Ký, đóng dấu / Signature, seal)', CO.rep, `${CO.repVi} / ${CO.repEn}`]),

    // Phụ lục
    new Paragraph({ pageBreakBefore: true, children: [] }),
    ...TITLE('PHỤ LỤC 01 – MÔ TẢ CÔNG VIỆC', 'APPENDIX 01 – JOB DESCRIPTION', 'Kèm theo Hợp đồng lao động số / Attached to Labour Contract No. .......... /HĐLĐ-VLS'),
    fill([['Người lao động', 'Employee']]),
    fill([['Chức danh', 'Position'], ['Bộ phận', 'Department']]),
    party('NHIỆM VỤ CHÍNH', 'Main duties'),
    ...[1, 2, 3, 4, 5, 6].map(i => P([t(`${i}.`, { b: true, c: TEAL }), tab(), tab()], { tabs: [{ type: TabStopType.LEFT, position: 400 }, { type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 200 })).map(p => p),
    party('YÊU CẦU', 'Requirements'),
    ...[1, 2, 3, 4].map(i => P([t(`${i}.`, { b: true, c: TEAL }), tab(), tab()], { tabs: [{ type: TabStopType.LEFT, position: 400 }, { type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 200 })),
  ];
  // ô nhiệm vụ/yêu cầu: chấm dẫn tới lề phải (thêm tab thứ 2)
  return doc('Hợp đồng lao động / Labour Contract', c);
}

// =====================================================================
// 2) THƯ MỜI NHẬN VIỆC
// =====================================================================
function offer() {
  const LBL = 3300;
  const row = (v, e, val, last) => new TableRow({ cantSplit: true, children: [
    new TableCell({ width: { size: LBL, type: WidthType.DXA }, margins: { top: 90, bottom: 90, left: 140, right: 140 },
      borders: { top: NB, left: NB, right: NB, bottom: last ? NB : { style: BorderStyle.SINGLE, size: 2, color: LINE } },
      children: [P([t(v, { b: true, c: DARK, size: 21 })], { af: 0 }), P([t(e, { i: true, c: GREY, size: 18 })], { af: 0 })] }),
    new TableCell({ width: { size: W - LBL, type: WidthType.DXA }, margins: { top: 90, bottom: 90, left: 140, right: 140 }, verticalAlign: VerticalAlign.CENTER,
      borders: { top: NB, left: NB, right: NB, bottom: last ? NB : { style: BorderStyle.SINGLE, size: 2, color: LINE } },
      children: [P([t(val, { size: 21 })], { af: 0 })] }),
  ] });
  const terms = [
    ['Vị trí', 'Position', '☐ Điều dưỡng   ☐ NV chăm sóc người cao tuổi   ☐ KTV Vật lý trị liệu, PHCN'],
    ['Hình thức làm việc', 'Employment type', '☐ Toàn thời gian / Full-time    ☐ Bán thời gian / cộng tác'],
    ['Địa điểm làm việc', 'Place of work', 'Viora Living Saigon – Cơ sở Lái Thiêu, KP. Bình Đức 2, P. Lái Thiêu, TP.HCM'],
    ['Quản lý trực tiếp', 'Reporting to', '...........................................................'],
    ['Ngày bắt đầu', 'Start date', '........ / ........ / ................'],
    ['Thời gian làm việc', 'Working hours', 'Theo ca / Shift work: .............................................'],
    ['Thử việc', 'Probation', '........ ngày / days   –   Lương / Salary: ........................ VNĐ'],
    ['Lương chính thức', 'Salary', '........................................ VNĐ / ☐ tháng (month)  ☐ giờ (hour)'],
    ['Phụ cấp, thưởng', 'Allowances, bonus', '...........................................................'],
  ];
  const termTable = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [LBL, W - LBL], layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.SINGLE, size: 8, color: TEAL }, bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL }, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB },
    rows: terms.map((r, i) => row(...r, i === terms.length - 1)) });
  const sectionHead = (v, e) => P([t(v.toUpperCase(), { b: true, c: TEAL, size: 21, sp: 8 }), t(`   ${e}`, { i: true, c: GREY, size: 19 })], { kn: true, bf: 240, af: 100 });
  const benefit = (v, e) => [
    P([t('✓', { b: true, c: TEAL }), tab(), t(v)], { tabs: [{ type: TabStopType.LEFT, position: 360 }], ind: { left: 360, hanging: 360 }, af: 0, kn: true }),
    P([t(e, { i: true, c: GREY, size: SZ_EN })], { ind: { left: 360 }, af: 90 }),
  ];
  const accept = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.SINGLE, size: 6, color: TEAL }, bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL }, left: { style: BorderStyle.SINGLE, size: 6, color: TEAL }, right: { style: BorderStyle.SINGLE, size: 6, color: TEAL }, insideHorizontal: NB, insideVertical: NB },
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({ width: { size: W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F4FAF9' },
      margins: { top: 160, bottom: 160, left: 240, right: 240 }, children: [
        P([t('XÁC NHẬN NHẬN VIỆC', { b: true, c: DARK, sp: 8 }), t('   Acceptance', { i: true, c: GREY, size: 19 })], { al: AlignmentType.CENTER, af: 120 }),
        VI('Tôi đã đọc, hiểu và đồng ý nhận việc theo các điều kiện nêu trong thư mời này.', { af: 0, al: AlignmentType.CENTER }),
        EN('I have read, understood and accept this offer on the terms above.', { al: AlignmentType.CENTER, af: 160 }),
        new Table({ width: { size: W - 480, type: WidthType.DXA }, columnWidths: [Math.round((W - 480) / 2), W - 480 - Math.round((W - 480) / 2)], borders: NONE, layout: TableLayoutType.FIXED, rows: [new TableRow({ children: [
          new TableCell({ width: { size: Math.round((W - 480) / 2), type: WidthType.DXA }, borders: NONE, children: [
            P([t('Ngày / Date:  ', { b: true }), t('........ / ........ / ................')], { af: 0 })] }),
          new TableCell({ width: { size: W - 480 - Math.round((W - 480) / 2), type: WidthType.DXA }, borders: NONE, children: [
            P([t('Ứng viên / Candidate', { b: true })], { al: AlignmentType.CENTER, af: 0 }),
            P([t('(Ký, ghi rõ họ tên / Signature, full name)', { i: true, c: GREY, size: 17 })], { al: AlignmentType.CENTER, af: 900 })] }),
        ] })] }),
      ] })] })] });

  const c = [
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [Math.round(W / 2), W - Math.round(W / 2)], borders: NONE, layout: TableLayoutType.FIXED, rows: [new TableRow({ children: [
      new TableCell({ width: { size: Math.round(W / 2), type: WidthType.DXA }, borders: NONE, children: [P([t('Số / Ref.:  .......... /TMNV-VLS', { size: 20, c: GREY })], { af: 0 })] }),
      new TableCell({ width: { size: W - Math.round(W / 2), type: WidthType.DXA }, borders: NONE, children: [
        P([t('TP. Hồ Chí Minh, ngày ...... tháng ...... năm ........', { i: true, size: 20 })], { al: AlignmentType.RIGHT, af: 0 })] }),
    ] })] }),
    ...TITLE('THƯ MỜI NHẬN VIỆC', 'LETTER OF OFFER'),
    fill([['Kính gửi Anh/Chị', 'Dear Mr./Ms.']]),
    gap(40),
    VI(`Thay mặt ${CO.vi}, chúng tôi trân trọng cảm ơn Anh/Chị đã quan tâm và tham gia quá trình tuyển dụng. Chúng tôi vui mừng mời Anh/Chị nhận việc với các điều kiện sau:`, { af: 20 }),
    EN(`On behalf of ${CO.en}, thank you for your interest and for taking part in our recruitment process. We are pleased to offer you employment on the following terms:`, { af: 200 }),
    termTable,
    sectionHead('Quyền lợi', 'Benefits'),
    ...benefit('Đào tạo chuyên môn về chăm sóc người cao tuổi tại Nhật Bản; chi phí ăn ở, đi lại do Viora chi trả.', 'Professional elderly-care training in Japan; accommodation, meals and travel paid by Viora.'),
    ...benefit('Bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp và các chế độ phúc lợi theo quy định.', 'Social, health and unemployment insurance and statutory benefits.'),
    ...benefit('Chỗ lưu trú tại Trung tâm cho nhân sự có nhu cầu.', 'On-site accommodation for staff who need it.'),
    ...benefit('Môi trường làm việc chuyên nghiệp, nhân văn; cơ hội phát triển nghề nghiệp lâu dài.', 'A professional, caring workplace with long-term career growth.'),
    sectionHead('Thông tin cần lưu ý', 'Please note'),
    fill([['Giấy tờ cần mang khi nhận việc', 'Documents to bring']]),
    fill([['Điều kiện kèm theo (nếu có)', 'Conditions (if any)']]),
    fill([['Vui lòng xác nhận trước ngày', 'Please confirm by']]),
    VI(`Chi tiết quyền lợi và nghĩa vụ được quy định trong Hợp đồng lao động. Mọi thắc mắc xin liên hệ Phòng Nhân sự: ${CO.hrPhone} – ${CO.hrEmail}.`, { af: 0, bf: 40 }),
    EN(`Full rights and obligations will be set out in the Labour Contract. For any questions, please contact Human Resources: ${CO.hrPhone} – ${CO.hrEmail}.`, { af: 120 }),
    VI('Chúng tôi rất mong được chào đón Anh/Chị gia nhập đội ngũ Viora Living Saigon.', { af: 0 }),
    EN('We look forward to welcoming you to the Viora Living Saigon team.', { af: 160 }),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [Math.round(W / 2), W - Math.round(W / 2)], borders: NONE, layout: TableLayoutType.FIXED, rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: Math.round(W / 2), type: WidthType.DXA }, borders: NONE, children: [P([])] }),
      new TableCell({ width: { size: W - Math.round(W / 2), type: WidthType.DXA }, borders: NONE, children: [
        P([t('TM. CÔNG TY', { b: true, c: DARK })], { al: AlignmentType.CENTER, af: 0 }),
        P([t('On behalf of the Company', { i: true, c: GREY, size: SZ_EN })], { al: AlignmentType.CENTER, af: 0 }),
        P([t('(Ký, đóng dấu / Signature, seal)', { i: true, c: GREY, size: 17 })], { al: AlignmentType.CENTER, af: 1100 }),
        P([t('.......................................', { b: true })], { al: AlignmentType.CENTER, af: 0 }),
        P([t('Chức danh / Title', { c: GREY, size: 19 })], { al: AlignmentType.CENTER, af: 0 })] }),
    ] })] }),
    gap(200),
    accept,
  ];
  return doc('Thư mời nhận việc / Letter of Offer', c);
}


// =====================================================================
// 3) QUYẾT ĐỊNH THÔI VIỆC (chấm dứt hợp đồng lao động)
// =====================================================================
function decision() {
  const half = Math.round(W / 2);
  const BASIS = (vi, en) => [
    P([t('–', { c: TEAL, b: true }), tab(), t(vi, { i: true })], { tabs: [{ type: TabStopType.LEFT, position: 300 }], ind: { left: 300, hanging: 300 }, al: AlignmentType.JUSTIFIED, af: 0, kn: true }),
    P([t(en, { i: true, c: GREY, size: SZ_EN })], { ind: { left: 300 }, al: AlignmentType.JUSTIFIED, af: 80 }),
  ];
  const ARTD = (no, vi, en, extra = []) => [
    P([t(`Điều ${no}. `, { b: true, c: TEAL }), t(vi)], { al: AlignmentType.JUSTIFIED, af: 0, bf: 120, kn: true }),
    P([t(`Article ${no}. `, { b: true, i: true, c: GREY, size: SZ_EN }), t(en, { i: true, c: GREY, size: SZ_EN })], { al: AlignmentType.JUSTIFIED, af: 80, kn: extra.length > 0 }),
    ...extra,
  ];
  const c = [
    // Số + ngày | Quốc hiệu
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [half - 400, W - half + 400], borders: NONE, layout: TableLayoutType.FIXED, rows: [new TableRow({ children: [
      new TableCell({ width: { size: half - 400, type: WidthType.DXA }, borders: NONE, children: [
        P([t('Số / No.:  .......... /QĐ-VLS', { size: 21 })], { af: 0, bf: 60 })] }),
      new TableCell({ width: { size: W - half + 400, type: WidthType.DXA }, borders: NONE, children: [
        P([t('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { b: true, size: 21 })], { al: AlignmentType.CENTER, af: 0 }),
        P([t('Độc lập – Tự do – Hạnh phúc', { b: true, size: 21 })], { al: AlignmentType.CENTER, af: 0 }),
        P([t('Socialist Republic of Vietnam · Independence – Freedom – Happiness', { i: true, c: GREY, size: 16 })], { al: AlignmentType.CENTER, af: 60 }),
        P([t('TP. Hồ Chí Minh, ngày ...... tháng ...... năm ........', { i: true, size: 20 })], { al: AlignmentType.CENTER, af: 0 })] }),
    ] })] }),
    P([], { af: 120 }),
    ...TITLE('QUYẾT ĐỊNH', 'DECISION'),
    P([t('Về việc chấm dứt hợp đồng lao động', { b: true })], { al: AlignmentType.CENTER, af: 0, bf: 0 }),
    P([t('On the termination of labour contract', { i: true, c: GREY, size: SZ_EN })], { al: AlignmentType.CENTER, af: 240 }),
    P([t(`GIÁM ĐỐC ${CO.vi}`, { b: true, c: DARK })], { al: AlignmentType.CENTER, af: 0 }),
    P([t(`DIRECTOR OF ${CO.en}`, { i: true, c: GREY, size: SZ_EN })], { al: AlignmentType.CENTER, af: 200 }),
    ...BASIS('Căn cứ Bộ luật Lao động số 45/2019/QH14 ngày 20/11/2019 và các văn bản hướng dẫn thi hành;', 'Pursuant to Labour Code No. 45/2019/QH14 dated 20 November 2019 and its guiding documents;'),
    ...BASIS(`Căn cứ Điều lệ tổ chức và hoạt động của ${CO.vi};`, `Pursuant to the Charter of ${CO.en};`),
    ...BASIS('Căn cứ Hợp đồng lao động số .......... /HĐLĐ-VLS ký ngày ........................;', 'Pursuant to Labour Contract No. .......... /HĐLĐ-VLS signed on ........................;'),
    ...BASIS('Căn cứ ☐ đơn xin nghỉ việc ngày ................  ☐ thỏa thuận chấm dứt ngày ................  ☐ thông báo hết hạn hợp đồng ngày ................  ☐ ................................;',
      'Pursuant to ☐ the resignation letter dated ................  ☐ the termination agreement dated ................  ☐ the notice of contract expiry dated ................  ☐ ................................;'),
    ...BASIS('Xét đề nghị của Phòng Hành chính – Nhân sự.', 'At the proposal of the Administration – Human Resources Department.'),
    P([t('QUYẾT ĐỊNH', { b: true, c: DARK, size: 26, sp: 20 }), t('   DECIDES', { i: true, c: GREY, size: 20 })], { al: AlignmentType.CENTER, bf: 200, af: 120 }),

    ...ARTD(1, 'Chấm dứt hợp đồng lao động đối với:', 'To terminate the labour contract with:', [
      fill([['Ông/Bà', 'Mr./Ms.']]),
      fill([['Chức danh', 'Position'], ['Bộ phận', 'Department']]),
      fill([['Số CCCD / Hộ chiếu', 'ID / Passport No.']]),
      fill([['Kể từ ngày', 'Effective from']]),
      P([t('Lý do', { b: true }), t(' / Reason', { i: true, c: GREY, size: SZ_EN }), t(':')], { af: 40, kn: true }),
      new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [Math.round(W / 2), W - Math.round(W / 2)], borders: NONE, layout: TableLayoutType.FIXED, rows: [
        ['☐  Người lao động xin nghỉ việc', 'Resignation', '☐  Hai bên thỏa thuận', 'Mutual agreement'],
        ['☐  Hết hạn hợp đồng', 'Contract expiry', '☐  Khác: ................................', 'Other'],
      ].map(([a, ae, b, be]) => new TableRow({ children: [a, b].map((x, k) => new TableCell({ width: { size: Math.round(W / 2), type: WidthType.DXA }, borders: NONE, margins: { left: 300 },
        children: [P([t(x), t(`  ${k ? be : ae}`, { i: true, c: GREY, size: SZ_EN })], { af: 60 })] })) })) }),
      P([], { af: 60 }),
    ]),
    ...ARTD(2, 'Ông/Bà có tên tại Điều 1 có trách nhiệm bàn giao đầy đủ công việc, hồ sơ, tài sản, đồng phục, thẻ và các trang thiết bị của Công ty cho ................................ trước ngày ................; tiếp tục bảo mật thông tin của người cao tuổi, gia đình họ và thông tin nội bộ của Công ty sau khi nghỉ việc.',
      'The person named in Article 1 shall hand over all work, records, assets, uniforms, cards and equipment of the Company to ................................ before ................, and shall continue to keep confidential the information of residents, their families and the Company after leaving.'),
    ...ARTD(3, 'Công ty có trách nhiệm thanh toán đầy đủ tiền lương, tiền phép năm chưa nghỉ, trợ cấp thôi việc (nếu đủ điều kiện) và các khoản liên quan; xác nhận thời gian đóng bảo hiểm xã hội và trả lại giấy tờ đã giữ (nếu có) cho người lao động theo đúng thời hạn quy định của pháp luật.',
      'The Company shall pay in full the salary, untaken annual leave, severance allowance (if eligible) and other related amounts; confirm the social insurance contribution period and return any documents held (if any) to the employee within the time limit required by law.'),
    ...ARTD(4, 'Quyết định có hiệu lực kể từ ngày ký. Phòng Hành chính – Nhân sự, Bộ phận Kế toán, các bộ phận liên quan và Ông/Bà có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này.',
      'This Decision takes effect from the date of signing. The Administration – HR Department, the Accounting Department, related departments and the person named in Article 1 are responsible for implementing this Decision.', [P([], { af: 200, kn: true })]),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [half, W - half], borders: NONE, layout: TableLayoutType.FIXED, rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: half, type: WidthType.DXA }, borders: NONE, children: [
        P([t('Nơi nhận', { b: true, i: true, size: 21 }), t(' / Recipients:', { i: true, c: GREY, size: 19 })], { af: 40 }),
        P([t('–  Như Điều 4 / As in Article 4;', { size: 20 })], { af: 0 }),
        P([t('–  Lưu: HC-NS / Filed: Admin – HR.', { size: 20 })], { af: 0 })] }),
      new TableCell({ width: { size: W - half, type: WidthType.DXA }, borders: NONE, children: [
        P([t('GIÁM ĐỐC', { b: true, c: DARK })], { al: AlignmentType.CENTER, af: 0 }),
        P([t('Director', { i: true, c: GREY, size: SZ_EN })], { al: AlignmentType.CENTER, af: 0 }),
        P([t('(Ký, đóng dấu / Signature, seal)', { i: true, c: GREY, size: 17 })], { al: AlignmentType.CENTER, af: 1300 }),
        P([t(CO.rep, { b: true })], { al: AlignmentType.CENTER, af: 0 })] }),
    ] })] }),
  ];
  return doc('Quyết định thôi việc / Termination Decision', c);
}


// =====================================================================
// 4) VĂN BẢN CHUNG: giấy tiêu đề trắng · công văn · quyết định
// =====================================================================
const half2 = () => Math.round(W / 2);
// Số / ngày bên trái – Quốc hiệu bên phải (thể thức văn bản hành chính)
function docHead(code) {
  const h = half2();
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [h - 400, W - h + 400], borders: NONE, layout: TableLayoutType.FIXED, rows: [new TableRow({ children: [
    new TableCell({ width: { size: h - 400, type: WidthType.DXA }, borders: NONE, children: [P([t(`Số / No.:  .......... /${code}`, { size: 21 })], { af: 0, bf: 60 })] }),
    new TableCell({ width: { size: W - h + 400, type: WidthType.DXA }, borders: NONE, children: [
      P([t('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { b: true, size: 21 })], { al: AlignmentType.CENTER, af: 0 }),
      P([t('Độc lập – Tự do – Hạnh phúc', { b: true, size: 21 })], { al: AlignmentType.CENTER, af: 0 }),
      P([t('━━━━━━', { c: GREY, size: 14 })], { al: AlignmentType.CENTER, af: 60 }),
      P([t('TP. Hồ Chí Minh, ngày ...... tháng ...... năm ........', { i: true, size: 20 })], { al: AlignmentType.CENTER, af: 0 })] }),
  ] })] });
}
function signBlock(recipients) {
  const h = half2();
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [h, W - h], borders: NONE, layout: TableLayoutType.FIXED, rows: [new TableRow({ cantSplit: true, children: [
    new TableCell({ width: { size: h, type: WidthType.DXA }, borders: NONE, children: [
      P([t('Nơi nhận', { b: true, i: true, size: 21 }), t(':', { i: true, size: 21 })], { af: 40 }),
      ...recipients.map(x => P([t(`–  ${x}`, { size: 20 })], { af: 0 }))] }),
    new TableCell({ width: { size: W - h, type: WidthType.DXA }, borders: NONE, children: [
      P([t('GIÁM ĐỐC', { b: true, c: DARK })], { al: AlignmentType.CENTER, af: 0 }),
      P([t('(Ký, đóng dấu)', { i: true, c: GREY, size: 17 })], { al: AlignmentType.CENTER, af: 1150 }),
      P([t(CO.rep, { b: true })], { al: AlignmentType.CENTER, af: 0 })] }),
  ] })] });
}
const body = n => Array.from({ length: n }, () => P([t('')], { af: 200, al: AlignmentType.JUSTIFIED }));

function blankLetterhead() {
  return doc('Giấy tiêu đề – Viora Living Saigon', [P([t('')], { af: 0 })]);
}
function congVan() {
  return doc('Công văn – Viora Living Saigon', [
    docHead('CV-VLS'),
    P([t('V/v: ', { b: true }), t('................................................................................................')], { bf: 120, af: 280 }),
    P([t('Kính gửi: ', { b: true }), t('...................................................................................')], { al: AlignmentType.CENTER, af: 240 }),
    P([t(`${CO.vi} trân trọng gửi đến Quý ............................ lời chào trân trọng.`)], { al: AlignmentType.JUSTIFIED, af: 120 }),
    P([t('[Nội dung công văn]', { i: true, c: GREY })], { al: AlignmentType.JUSTIFIED, af: 120 }),
    ...body(6),
    P([t('Trân trọng./.')], { af: 300, kn: true }),
    signBlock(['Như trên;', 'Lưu: VT, HC-NS.']),
  ]);
}
function quyetDinh() {
  const base = x => P([t('Căn cứ ', { i: true }), t(x, { i: true })], { al: AlignmentType.JUSTIFIED, af: 60, ind: { left: 0 } });
  const art = n => P([t(`Điều ${n}. `, { b: true, c: TEAL }), t('................................................................................................................................')], { al: AlignmentType.JUSTIFIED, af: 140 });
  return doc('Quyết định – Viora Living Saigon', [
    docHead('QĐ-VLS'),
    P([], { af: 120 }),
    ...TITLE('QUYẾT ĐỊNH', 'DECISION'),
    P([t('Về việc ..........................................................', { b: true })], { al: AlignmentType.CENTER, af: 240 }),
    P([t(`GIÁM ĐỐC ${CO.vi}`, { b: true, c: DARK })], { al: AlignmentType.CENTER, af: 200 }),
    base(`Điều lệ tổ chức và hoạt động của ${CO.vi};`),
    base('..............................................................................................................;'),
    base('..............................................................................................................;'),
    P([t('Xét đề nghị của ..........................................................', { i: true })], { af: 160 }),
    P([t('QUYẾT ĐỊNH:', { b: true, c: DARK, size: 26, sp: 20 })], { al: AlignmentType.CENTER, af: 160 }),
    art(1), art(2),
    P([t('Điều 3. ', { b: true, c: TEAL }), t('Quyết định có hiệu lực kể từ ngày ký. ............................................................ chịu trách nhiệm thi hành Quyết định này./.')], { al: AlignmentType.JUSTIFIED, af: 300, kn: true }),
    signBlock(['Như Điều 3;', 'Lưu: VT, HC-NS.']),
  ]);
}


// =====================================================================
// 5) MẪU BỔ SUNG – NHÂN SỰ & VẬN HÀNH
// =====================================================================
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const GRID_B = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER, insideHorizontal: BORDER, insideVertical: BORDER };
const SEC = (vi, en) => P([t(vi.toUpperCase(), { b: true, c: TEAL, size: 21, sp: 6 }), ...(en ? [t(`  ·  ${en}`, { i: true, c: GREY, size: 19 })] : [])],
  { kn: true, bf: 200, af: 100, bd: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 3 } } });
const TXT = (text, o = {}) => P([t(text, o)], { al: AlignmentType.JUSTIFIED, af: o.af ?? 100, ind: o.ind, kn: o.kn });
const NUM = (n, text, kn) => P([t(`${n}`, { b: true, c: TEAL }), tab(), t(text)], { al: AlignmentType.JUSTIFIED, af: 90, kn, ind: { left: 400, hanging: 400 }, tabs: [{ type: TabStopType.LEFT, position: 400 }] });
const CHECKS = (label, items) => P([...(label ? [t(label + '   ', { b: true })] : []), ...items.flatMap((x, i) => [t((i ? '     ' : '') + '☐  ' + x)])], { af: 100 });
const TITLE1 = (vi, sub) => [
  P([t(vi, { b: true, size: 32, c: DARK, sp: 10 })], { al: AlignmentType.CENTER, af: 40, bf: 60 }),
  P([t('━━━━', { c: GOLD, size: 18 })], { al: AlignmentType.CENTER, af: sub ? 60 : 220 }),
  ...(sub ? [P([t(sub, { size: 21, c: GREY, i: true })], { al: AlignmentType.CENTER, af: 220 })] : []),
];
// Bảng lưới: tiêu đề + n dòng trống
function grid(headers, widths, nRows, fillRows = []) {
  const cellP = (x, head) => new TableCell({ width: { size: 0, type: WidthType.DXA }, children: [] });
  const mk = (txt, w, head) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 90, right: 90 },
    shading: head ? { type: ShadingType.CLEAR, color: 'auto', fill: TINT } : undefined, verticalAlign: VerticalAlign.CENTER,
    children: [P([t(txt, { b: head, c: head ? DARK : INK, size: head ? 20 : 21 })], { al: head ? AlignmentType.CENTER : AlignmentType.LEFT, af: 0 })] });
  const rows = [new TableRow({ tableHeader: true, children: headers.map((h, i) => mk(h, widths[i], true)) })];
  for (let r = 0; r < nRows; r++) rows.push(new TableRow({ height: { value: 440, rule: 'atLeast' }, children: widths.map((w, i) => mk((fillRows[r] || [])[i] ?? (i === 0 && headers[0] === 'STT' ? String(r + 1) : ''), w, false)) }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, borders: GRID_B, rows });
}
// Bảng nhãn – ô trống để điền
function kv(rows, lw = 3200) {
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [lw, W - lw], layout: TableLayoutType.FIXED, borders: GRID_B,
    rows: rows.map(([l, v]) => new TableRow({ height: { value: 420, rule: 'atLeast' }, children: [
      new TableCell({ width: { size: lw, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: TINT }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, verticalAlign: VerticalAlign.CENTER, children: [P([t(l, { b: true, c: DARK, size: 20 })], { af: 0 })] }),
      new TableCell({ width: { size: W - lw, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, verticalAlign: VerticalAlign.CENTER, children: [P([t(v || '', { size: 21 })], { af: 0 })] }),
    ] })) });
}
// Chữ ký n cột: [tiêu đề, ghi chú, tên]
function sigN(cols, gapAf = 1200) {
  const w = Math.floor(W / cols.length);
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cols.map(() => w), borders: NONE, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ cantSplit: true, children: cols.map(([title, note, name]) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: NONE, children: [
      P([t(title, { b: true, c: DARK, size: 21 })], { al: AlignmentType.CENTER, af: 0 }),
      P([t(note || '(Ký, ghi rõ họ tên)', { i: true, c: GREY, size: 17 })], { al: AlignmentType.CENTER, af: gapAf }),
      P([t(name || '.................................', { b: true })], { al: AlignmentType.CENTER, af: 0 }),
    ] })) })] });
}
const partyA = (label = 'BÊN A', en = 'Party A') => [
  P([t(`${label} – ${CO.vi}`, { b: true, c: TEAL, size: 21 }), ...(en ? [t(`  ·  ${en} – ${CO.en}`, { i: true, c: GREY, size: 18 })] : [])], { kn: true, bf: 160, af: 80 }),
  P([t(`MSDN: ${CO.mst}  ·  Địa chỉ: ${CO.addrVi}`, { size: 20 })], { af: 40 }),
  P([t(`Đại diện: Ông ${CO.rep} – ${CO.repVi}${en ? ` / Represented by Mr. ${CO.rep} – ${CO.repEn}` : ''}`, { size: 20 })], { af: 120 }),
];

// ---------- 5.1 Thỏa thuận đào tạo tại Nhật Bản (song ngữ) ----------
function daoTaoNhat() {
  return doc('Thỏa thuận đào tạo tại Nhật Bản', [
    ...TITLE('THỎA THUẬN ĐÀO TẠO TẠI NHẬT BẢN', 'TRAINING AGREEMENT – JAPAN', 'Số / No.:  .......... /TTĐT-VLS'),
    VI('Căn cứ Bộ luật Lao động số 45/2019/QH14 (Điều 61, 62) và Hợp đồng lao động số .......... /HĐLĐ-VLS ký ngày ..................; hai bên thỏa thuận như sau:', { i: true, size: 21 }),
    EN('Pursuant to Labour Code No. 45/2019/QH14 (Articles 61, 62) and Labour Contract No. .......... /HĐLĐ-VLS dated ..................; the parties agree as follows:'),
    ...partyA('BÊN A – NGƯỜI SỬ DỤNG LAO ĐỘNG', 'Party A – Employer'),
    P([t('BÊN B – NGƯỜI LAO ĐỘNG', { b: true, c: TEAL, size: 21 }), t('  ·  Party B – Employee', { i: true, c: GREY, size: 18 })], { kn: true, bf: 80, af: 80 }),
    fill([['Họ và tên', 'Full name'], ['Chức danh', 'Position']]),
    fill([['Số CCCD / Hộ chiếu', 'ID / Passport No.'], ['Điện thoại', 'Phone']]),
    ART(1, 'Nội dung đào tạo', 'Training programme'),
    ...ITEM('1.', 'Chương trình / nghề đào tạo: ....................................................................................',
      'Programme / skill: ....................................................................................'),
    ...ITEM('2.', 'Nơi đào tạo: Nhật Bản – cơ sở đào tạo: ......................................................................',
      'Place: Japan – training institution: ......................................................................'),
    ...ITEM('3.', 'Thời gian đào tạo: từ ngày .................... đến ngày .................... (dự kiến ........ tháng).',
      'Duration: from .................... to .................... (approx. ........ months).'),
    ...ITEM('4.', 'Chứng chỉ / kết quả đạt được sau đào tạo: ....................................................................',
      'Certificate / outcome: ....................................................................'),
    ART(2, 'Chi phí đào tạo do Bên A chi trả', 'Training costs paid by Party A'),
    grid(['Khoản chi phí / Cost item', 'Dự kiến (VNĐ) / Estimate (VND)', 'Ghi chú / Note'], [4300, 2500, W - 6800], 7,
      [['Học phí đào tạo / Tuition'], ['Vé máy bay khứ hồi / Return airfare'], ['Chỗ ở / Accommodation'], ['Ăn uống / Meals'],
       ['Đi lại tại Nhật / Local transport'], ['Visa, bảo hiểm, hồ sơ / Visa, insurance, documents'], ['TỔNG CỘNG / TOTAL']]),
    gap(80),
    ...ITEM('', 'Tiền lương và chế độ của Bên B trong thời gian đào tạo: ....................................................',
      'Party B’s salary and benefits during training: ....................................................'),
    ART(3, 'Trách nhiệm của Bên B', 'Party B’s obligations'),
    ...ITEM('1.', 'Tham gia đầy đủ và hoàn thành chương trình đào tạo; tuân thủ pháp luật Nhật Bản, quy định của cơ sở đào tạo và hướng dẫn của Bên A.',
      'Attend and complete the programme; comply with Japanese law, the institution’s rules and Party A’s instructions.'),
    ...ITEM('2.', 'Về nước đúng thời hạn và báo cáo kết quả đào tạo cho Bên A; áp dụng kiến thức đã học vào công việc tại Viora.',
      'Return on time, report the results to Party A and apply the skills learned at Viora.'),
    ART(4, 'Cam kết làm việc sau đào tạo', 'Service commitment after training'),
    ...ITEM('', 'Sau khi hoàn thành đào tạo, Bên B cam kết làm việc cho Bên A tối thiểu ........ tháng, kể từ ngày ....................',
      'After completing the training, Party B undertakes to work for Party A for at least ........ months from ....................'),
    ART(5, 'Hoàn trả chi phí đào tạo', 'Reimbursement of training costs'),
    ...ITEM('1.', 'Bên B hoàn trả chi phí đào tạo nếu: ☐ đơn phương chấm dứt hợp đồng lao động trái pháp luật; ☐ tự ý bỏ dở chương trình đào tạo; ☐ nghỉ việc trước khi hết thời gian cam kết tại Điều 4; ☐ ..................................',
      'Party B shall reimburse the training costs if: ☐ unlawfully terminating the labour contract; ☐ abandoning the programme; ☐ leaving before the end of the commitment in Article 4; ☐ ..................................'),
    ...ITEM('2.', 'Cách tính số tiền hoàn trả: ..................................................................................... ; thời hạn và phương thức hoàn trả: ...........................................',
      'Calculation of the amount: ..................................................................................... ; time limit and method: ...........................................'),
    ART(6, 'Điều khoản chung', 'General provisions'),
    ...ITEM('', 'Thỏa thuận là bộ phận không tách rời của Hợp đồng lao động; lập 02 bản song ngữ có giá trị như nhau, bản tiếng Việt được ưu tiên khi có khác biệt; có hiệu lực từ ngày ký.',
      'This agreement forms an integral part of the Labour Contract; made in 02 bilingual originals of equal validity, the Vietnamese version prevailing; effective on signing.', true),
    P([], { af: 200, kn: true }),
    signatures(['BÊN B – NGƯỜI LAO ĐỘNG', 'Party B – Employee', '(Ký, ghi rõ họ tên / Signature, full name)', '.......................................'],
               ['BÊN A – NGƯỜI SỬ DỤNG LAO ĐỘNG', 'Party A – Employer', '(Ký, đóng dấu / Signature, seal)', CO.rep, `${CO.repVi} / ${CO.repEn}`]),
  ]);
}

// ---------- 5.2 Cam kết bảo mật thông tin (song ngữ) ----------
function baoMat() {
  return doc('Cam kết bảo mật thông tin', [
    ...TITLE('CAM KẾT BẢO MẬT THÔNG TIN', 'CONFIDENTIALITY UNDERTAKING'),
    fill([['Tôi tên', 'I, full name']]),
    fill([['Chức danh', 'Position'], ['Bộ phận', 'Department']]),
    fill([['Số CCCD / Hộ chiếu', 'ID / Passport No.']]),
    VI(`Là người lao động / cộng tác viên của ${CO.vi} (“Viora”), tôi cam kết:`, { af: 0, bf: 60 }),
    EN(`As an employee / collaborator of ${CO.en} (“Viora”), I undertake:`),
    ART(1, 'Thông tin cần bảo mật', 'Confidential information'),
    ...ITEM('', 'Hồ sơ sức khỏe, bệnh án, thuốc, thông tin cá nhân, hình ảnh của người cao tuổi và gia đình họ; thông tin nhân sự, lương, tài chính, hợp đồng, giá dịch vụ, quy trình nội bộ và mọi tài liệu khác của Viora.',
      'Health records, medication, personal information and images of residents and their families; HR, payroll, financial, contract and pricing information, internal procedures and all other Viora documents.'),
    ART(2, 'Cam kết của tôi', 'My undertakings'),
    ...ITEM('1.', 'Chỉ sử dụng thông tin cho công việc được giao; không tiết lộ cho bất kỳ ai không có thẩm quyền.', 'Use the information only for assigned work and not disclose it to anyone unauthorised.'),
    ...ITEM('2.', 'Không chụp ảnh, quay phim, đăng tải lên mạng xã hội hình ảnh hoặc thông tin của người cao tuổi khi chưa được Viora và gia đình đồng ý bằng văn bản.', 'Not photograph, film or post images or information of residents on social media without written consent of Viora and the family.'),
    ...ITEM('3.', 'Không sao chép, mang tài liệu, dữ liệu ra ngoài khi không được phép; bảo vệ mật khẩu, thiết bị được giao.', 'Not copy or remove documents or data without permission; protect assigned passwords and devices.'),
    ...ITEM('4.', 'Báo ngay cho quản lý khi phát hiện thông tin bị lộ hoặc có nguy cơ bị lộ.', 'Report immediately to my manager any actual or suspected disclosure.'),
    ...ITEM('5.', 'Hoàn trả toàn bộ tài liệu, dữ liệu, thiết bị khi chấm dứt làm việc.', 'Return all documents, data and devices when my work ends.'),
    ART(3, 'Thời hạn và trách nhiệm', 'Duration and liability'),
    ...ITEM('', 'Cam kết có hiệu lực trong suốt thời gian làm việc và tiếp tục sau khi chấm dứt. Nếu vi phạm, tôi chịu xử lý kỷ luật theo nội quy, bồi thường thiệt hại và chịu trách nhiệm theo quy định của pháp luật.',
      'This undertaking applies throughout my work and continues after it ends. In case of breach, I accept disciplinary action under the internal rules, compensation for damage and liability under the law.', true),
    P([t('TP. Hồ Chí Minh, ngày ...... tháng ...... năm ........', { i: true, size: 20 })], { al: AlignmentType.RIGHT, bf: 160, af: 160, kn: true }),
    signatures(['XÁC NHẬN CỦA CÔNG TY', 'Confirmed by the Company', '(Ký, đóng dấu / Signature, seal)', '.......................................'],
               ['NGƯỜI CAM KẾT', 'Undertaken by', '(Ký, ghi rõ họ tên / Signature, full name)', '.......................................']),
  ]);
}

// ---------- 5.3 Hợp đồng dịch vụ cộng tác (song ngữ) ----------
function congTac() {
  return doc('Hợp đồng dịch vụ cộng tác', [
    ...TITLE('HỢP ĐỒNG DỊCH VỤ CỘNG TÁC', 'SERVICE COLLABORATION AGREEMENT', 'Số / No.:  .......... /HĐCT-VLS'),
    VI('Căn cứ Bộ luật Dân sự số 91/2015/QH13 và nhu cầu của hai bên;', { i: true, size: 21 }),
    EN('Pursuant to Civil Code No. 91/2015/QH13 and the needs of both parties;'),
    ...partyA('BÊN A – BÊN THUÊ DỊCH VỤ', 'Party A – Client'),
    P([t('BÊN B – BÊN CỘNG TÁC', { b: true, c: TEAL, size: 21 }), t('  ·  Party B – Collaborator', { i: true, c: GREY, size: 18 })], { kn: true, bf: 80, af: 80 }),
    fill([['Họ và tên', 'Full name']]),
    fill([['Số CCCD / Hộ chiếu', 'ID / Passport No.'], ['Mã số thuế', 'Tax code']]),
    fill([['Địa chỉ', 'Address']]),
    fill([['Tài khoản', 'Bank account'], ['Ngân hàng', 'Bank']]),
    ART(1, 'Nội dung công việc', 'Scope of services'),
    ...ITEM('', 'Bên B thực hiện: ........................................................................................................ (Phụ lục / mô tả kèm theo nếu có). Bên B tự chủ về cách thức thực hiện, bảo đảm chất lượng và tuân thủ quy định an toàn, bảo mật của Bên A khi làm việc tại Trung tâm.',
      'Party B shall provide: ........................................................................................................ (appendix if any). Party B decides how to perform the services, ensures quality and follows Party A’s safety and confidentiality rules at the Centre.'),
    ART(2, 'Thời hạn', 'Term'),
    ...ITEM('', 'Từ ngày .................... đến ngày ....................  /  theo từng đợt, ca hoặc buổi được hai bên xác nhận.', 'From .................... to ....................  /  per session or batch confirmed by both parties.'),
    ART(3, 'Thù lao và thanh toán', 'Fees and payment'),
    ...ITEM('1.', 'Thù lao: ........................ VNĐ / ☐ buổi  ☐ giờ  ☐ tháng  ☐ khối lượng: ........................', 'Fee: VND ........................ per ☐ session  ☐ hour  ☐ month  ☐ output: ........................'),
    ...ITEM('2.', 'Thanh toán bằng chuyển khoản trước ngày ........ hằng tháng, sau khi hai bên đối chiếu khối lượng. Bên A khấu trừ thuế thu nhập cá nhân theo quy định (nếu có).', 'Paid by bank transfer before the ........ of each month after reconciliation. Party A withholds personal income tax as required (if any).'),
    ART(4, 'Quyền và nghĩa vụ', 'Rights and obligations'),
    ...ITEM('1.', 'Bên B bảo mật thông tin người cao tuổi và của Bên A (theo Cam kết bảo mật đính kèm); bồi thường thiệt hại do lỗi của mình.', 'Party B keeps residents’ and Party A’s information confidential (per the attached undertaking) and compensates for damage caused by its fault.'),
    ...ITEM('2.', 'Bên A cung cấp thông tin, điều kiện cần thiết và thanh toán đúng hạn.', 'Party A provides necessary information and conditions and pays on time.'),
    ART(5, 'Chấm dứt và điều khoản chung', 'Termination and general'),
    ...ITEM('', 'Mỗi bên có thể chấm dứt hợp đồng khi báo trước ........ ngày. Tranh chấp được thương lượng; nếu không thành, giải quyết tại Tòa án có thẩm quyền. Lập 02 bản song ngữ, bản tiếng Việt được ưu tiên khi có khác biệt.',
      'Either party may terminate with ........ days’ notice. Disputes are negotiated, failing which they go to a competent court. Made in 02 bilingual originals, the Vietnamese version prevailing.', true),
    P([], { af: 200, kn: true }),
    signatures(['BÊN B – BÊN CỘNG TÁC', 'Party B – Collaborator', '(Ký, ghi rõ họ tên / Signature, full name)', '.......................................'],
               ['BÊN A – BÊN THUÊ DỊCH VỤ', 'Party A – Client', '(Ký, đóng dấu / Signature, seal)', CO.rep, `${CO.repVi} / ${CO.repEn}`]),
  ]);
}

// ---------- 5.4 Quyết định tiếp nhận · 5.5 Quyết định bổ nhiệm ----------
function qdNhanSu(kind) {
  const tiepNhan = kind === 'tiep-nhan';
  const base = x => P([t('Căn cứ ', { i: true }), t(x, { i: true })], { al: AlignmentType.JUSTIFIED, af: 30 });
  const ARTV = (n, text, kn) => P([t(`Điều ${n}. `, { b: true, c: TEAL }), t(text)], { al: AlignmentType.JUSTIFIED, af: 80, kn });
  return doc(tiepNhan ? 'Quyết định tiếp nhận nhân sự' : 'Quyết định bổ nhiệm', [
    docHead('QĐ-VLS'), P([], { af: 20 }),
    ...TITLE1('QUYẾT ĐỊNH', tiepNhan ? 'Về việc tiếp nhận nhân sự' : 'Về việc bổ nhiệm'),
    P([t(`GIÁM ĐỐC ${CO.vi}`, { b: true, c: DARK })], { al: AlignmentType.CENTER, af: 140 }),
    base(`Điều lệ tổ chức và hoạt động của ${CO.vi};`),
    base(tiepNhan ? 'Hợp đồng lao động số .......... /HĐLĐ-VLS ký ngày ....................;' : 'Nhu cầu tổ chức, quản lý và năng lực của nhân sự;'),
    P([t('Xét đề nghị của Phòng Hành chính – Nhân sự.', { i: true })], { af: 80 }),
    P([t('QUYẾT ĐỊNH:', { b: true, c: DARK, size: 26, sp: 20 })], { al: AlignmentType.CENTER, af: 100 }),
    ARTV(1, tiepNhan ? 'Tiếp nhận Ông/Bà ................................................., sinh ngày .................... vào làm việc tại Công ty:' : 'Bổ nhiệm Ông/Bà ................................................., hiện là .......................................... giữ chức vụ:'),
    kv(tiepNhan
      ? [['Chức danh', '☐ Điều dưỡng   ☐ NV chăm sóc NCT   ☐ KTV VLTL – PHCN   ☐ ..........'], ['Bộ phận', ''], ['Ngày bắt đầu làm việc', ''], ['Thử việc', '........ ngày, từ ............ đến ............'], ['Mức lương', 'Theo Hợp đồng lao động / Thư mời nhận việc']]
      : [['Chức vụ được bổ nhiệm', ''], ['Bộ phận', ''], ['Thời hạn bổ nhiệm', 'Từ ngày ............  ☐ đến ngày ............  ☐ không thời hạn'], ['Phụ cấp chức vụ (nếu có)', ''], ['Quyền hạn, nhiệm vụ', 'Theo Bản mô tả công việc kèm theo']]),
    gap(80),
    ARTV(2, tiepNhan ? 'Ông/Bà có tên tại Điều 1 có trách nhiệm chấp hành nội quy, quy trình chuyên môn và sự phân công của người quản lý; được hưởng lương và các chế độ theo hợp đồng lao động và quy định của Công ty.' : 'Ông/Bà có tên tại Điều 1 được hưởng các quyền lợi theo chức vụ và chịu trách nhiệm trước Giám đốc về nhiệm vụ được giao.'),
    ARTV(3, 'Quyết định có hiệu lực kể từ ngày ký. Phòng Hành chính – Nhân sự, Bộ phận Kế toán, các bộ phận liên quan và Ông/Bà có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.', true),
    gap(100, true),
    signBlock(['Như Điều 3;', 'Lưu: VT, HC-NS.']),
  ]);
}

// ---------- 5.6 Biên bản bàn giao ----------
function banGiao() {
  return doc('Biên bản bàn giao', [
    docHead('BB-VLS'), P([], { af: 80 }),
    ...TITLE1('BIÊN BẢN BÀN GIAO', 'Công việc – Tài sản – Hồ sơ'),
    TXT('Hôm nay, ngày ...... tháng ...... năm ........, tại ........................................................, chúng tôi gồm:'),
    kv([['Bên giao', 'Ông/Bà ........................................  Chức danh: ........................................'],
        ['Bên nhận', 'Ông/Bà ........................................  Chức danh: ........................................'],
        ['Người chứng kiến', 'Ông/Bà ........................................  Chức danh: ........................................'],
        ['Lý do bàn giao', '☐ Nghỉ việc   ☐ Chuyển vị trí   ☐ Nghỉ dài ngày   ☐ Khác: ........................']]),
    SEC('1. Công việc đang thực hiện'),
    grid(['STT', 'Nội dung công việc', 'Tình trạng', 'Ghi chú'], [700, 4700, 2100, W - 7500], 4),
    SEC('2. Tài sản, thiết bị, đồng phục'),
    grid(['STT', 'Tên tài sản / thiết bị', 'Số lượng', 'Tình trạng', 'Ghi chú'], [700, 3900, 1200, 1900, W - 7700], 5),
    SEC('3. Hồ sơ, tài liệu, tài khoản'),
    grid(['STT', 'Tên hồ sơ / tài liệu / tài khoản', 'Số lượng', 'Ghi chú'], [700, 5000, 1300, W - 7000], 4),
    gap(80),
    TXT('Hai bên đã kiểm tra, thống nhất nội dung bàn giao trên. Biên bản lập thành 02 bản, mỗi bên giữ 01 bản.', { kn: true }),
    gap(80, true),
    sigN([['BÊN GIAO'], ['NGƯỜI CHỨNG KIẾN'], ['BÊN NHẬN']]),
  ]);
}

// ---------- 5.7 Thông báo kết quả thử việc ----------
function thuViec() {
  return doc('Thông báo kết quả thử việc', [
    docHead('TB-VLS'), P([], { af: 80 }),
    ...TITLE1('THÔNG BÁO', 'Về kết quả thử việc'),
    P([t('Kính gửi: ', { b: true }), t('Ông/Bà ........................................................')], { al: AlignmentType.CENTER, af: 200 }),
    TXT(`${CO.vi} thông báo kết quả thử việc của Ông/Bà như sau:`),
    kv([['Chức danh thử việc', ''], ['Thời gian thử việc', 'Từ ngày ............ đến ngày ............'], ['Người đánh giá', ''],
        ['Kết quả', '☐ Đạt yêu cầu      ☐ Không đạt yêu cầu'], ['Nhận xét', '']]),
    SEC('Nếu đạt yêu cầu'),
    TXT('Ông/Bà được ký kết hợp đồng lao động chính thức kể từ ngày .................... với mức lương ........................ VNĐ/tháng và các chế độ theo hợp đồng lao động. Đề nghị Ông/Bà liên hệ Phòng Hành chính – Nhân sự để ký hợp đồng trước ngày ....................'),
    SEC('Nếu không đạt yêu cầu'),
    TXT('Hai bên chấm dứt thỏa thuận thử việc kể từ ngày ..................... Công ty thanh toán đầy đủ tiền lương thử việc cho thời gian đã làm việc. Cảm ơn Ông/Bà đã đồng hành cùng Viora trong thời gian qua.', { kn: true }),
    gap(160, true),
    signBlock(['Ông/Bà có tên trên;', 'Lưu: HC-NS.']),
  ]);
}

// ---------- 5.8 Phụ lục hợp đồng lao động ----------
function phuLuc() {
  return doc('Phụ lục hợp đồng lao động', [
    docHead('PLHĐ-VLS'), P([], { af: 80 }),
    ...TITLE1('PHỤ LỤC HỢP ĐỒNG LAO ĐỘNG', 'Kèm theo Hợp đồng lao động số .......... /HĐLĐ-VLS ký ngày ....................'),
    ...partyA('BÊN A – NGƯỜI SỬ DỤNG LAO ĐỘNG', ''),
    P([t('BÊN B – NGƯỜI LAO ĐỘNG', { b: true, c: TEAL, size: 21 })], { af: 80 }),
    P([t('Ông/Bà: ', { b: true }), tab()], { tabs: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 110 }),
    TXT('Hai bên thỏa thuận sửa đổi, bổ sung nội dung hợp đồng lao động như sau:'),
    grid(['STT', 'Nội dung sửa đổi', 'Theo hợp đồng hiện tại', 'Nội dung mới'], [700, 2700, 3000, W - 6400], 4,
      [['1', '☐ Mức lương'], ['2', '☐ Chức danh / công việc'], ['3', '☐ Phụ cấp'], ['4', '☐ Khác: ..............']]),
    gap(100),
    NUM('1.', 'Phụ lục có hiệu lực từ ngày ......................... Các nội dung khác của hợp đồng lao động giữ nguyên.'),
    NUM('2.', 'Phụ lục là bộ phận không tách rời của hợp đồng lao động, lập thành 02 bản, mỗi bên giữ 01 bản.', true),
    gap(200, true),
    sigN([['NGƯỜI LAO ĐỘNG'], ['NGƯỜI SỬ DỤNG LAO ĐỘNG', '(Ký, đóng dấu)', CO.rep]]),
  ]);
}

// ---------- 5.9 Đơn xin nghỉ phép · 5.10 Đơn xin nghỉ việc ----------
function donNghi(kind) {
  const phep = kind === 'phep';
  const quocHieu = [
    P([t('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { b: true, size: 22 })], { al: AlignmentType.CENTER, af: 0 }),
    P([t('Độc lập – Tự do – Hạnh phúc', { b: true, size: 22 })], { al: AlignmentType.CENTER, af: 0 }),
    P([t('━━━━━━', { c: GREY, size: 14 })], { al: AlignmentType.CENTER, af: 60 }),
  ];
  const line = (label) => P([t(label + ': ', { b: true }), tab()], { tabs: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 120 });
  return doc(phep ? 'Đơn xin nghỉ phép' : 'Đơn xin nghỉ việc', [
    ...quocHieu,
    ...TITLE1(phep ? 'ĐƠN XIN NGHỈ PHÉP' : 'ĐƠN XIN NGHỈ VIỆC'),
    P([t('Kính gửi: ', { b: true }), t(`– Ban Giám đốc ${CO.vi}`)], { af: 0, ind: { left: 1200 } }),
    P([t('– Phòng Hành chính – Nhân sự; Quản lý trực tiếp: ...............................')], { af: 200, ind: { left: 2300 } }),
    line('Tôi tên'), line('Chức danh / Bộ phận'), line('Số điện thoại'),
    ...(phep ? [
      CHECKS('Loại nghỉ:', ['Phép năm', 'Việc riêng có lương', 'Không lương', 'Ốm đau', 'Khác: ..........']),
      line('Thời gian nghỉ (từ ngày – đến ngày, số ngày)'), line('Lý do'), line('Người nhận bàn giao công việc / ca trực'),
      TXT('Tôi cam kết bàn giao đầy đủ công việc, ca trực trước khi nghỉ và đi làm lại đúng thời hạn.', { af: 200 }),
    ] : [
      line('Ngày vào làm'), line('Số hợp đồng lao động'),
      line('Ngày dự kiến nghỉ việc'), line('Lý do'),
      TXT('Tôi cam kết bàn giao đầy đủ công việc, tài sản, hồ sơ theo hướng dẫn của Công ty trước ngày nghỉ việc và thực hiện đúng thời hạn báo trước theo quy định.', { af: 200 }),
    ]),
    P([t('TP. Hồ Chí Minh, ngày ...... tháng ...... năm ........', { i: true, size: 20 })], { al: AlignmentType.RIGHT, af: 120, kn: true }),
    sigN([['Ý KIẾN QUẢN LÝ', '(Ký, ghi rõ họ tên)'], ['DUYỆT CỦA BAN GIÁM ĐỐC', '(Ký, ghi rõ họ tên)'], ['NGƯỜI LÀM ĐƠN', '(Ký, ghi rõ họ tên)']]),
  ]);
}

// ---------- 6.1 Hợp đồng dịch vụ chăm sóc ----------
function hdDichVu() {
  const ARTV = (n, title) => P([t(`ĐIỀU ${n}. `, { b: true, c: TEAL, size: 22 }), t(title.toUpperCase(), { b: true, c: DARK, size: 22 })],
    { kn: true, bf: 200, af: 100, sh: { type: ShadingType.CLEAR, color: 'auto', fill: TINT }, bd: { left: { style: BorderStyle.SINGLE, size: 24, color: TEAL, space: 6 } }, ind: { left: 120 } });
  return doc('Hợp đồng dịch vụ chăm sóc người cao tuổi', [
    docHead('HĐDV-VLS'), P([], { af: 80 }),
    ...TITLE1('HỢP ĐỒNG DỊCH VỤ CHĂM SÓC NGƯỜI CAO TUỔI'),
    TXT('Căn cứ Bộ luật Dân sự số 91/2015/QH13, Luật Người cao tuổi số 39/2009/QH12 và nhu cầu của các bên; hôm nay, ngày ...... tháng ...... năm ........, chúng tôi gồm:', { i: true, size: 21 }),
    ...partyA('BÊN A – BÊN CUNG CẤP DỊCH VỤ', ''),
    SEC('Bên B – Người ký hợp đồng (người cao tuổi hoặc người đại diện / người thân)'),
    kv([['Họ và tên', ''], ['Số CCCD / Hộ chiếu', ''], ['Địa chỉ', ''], ['Điện thoại / Email', ''], ['Quan hệ với người được chăm sóc', '☐ Chính người được chăm sóc   ☐ Con   ☐ Vợ / chồng   ☐ Khác: ..........']]),
    SEC('Người được chăm sóc'),
    kv([['Họ và tên', ''], ['Ngày sinh / Giới tính', ''], ['Số CCCD', ''], ['Người liên hệ khẩn cấp', 'Họ tên: ..........................   Điện thoại: ..........................']]),
    ARTV(1, 'Dịch vụ'),
    NUM('1.', 'Gói dịch vụ: ................................................................ (chi tiết tại Phụ lục 01 – Danh mục dịch vụ & bảng giá).'),
    NUM('2.', 'Phòng ở: ☐ phòng đơn   ☐ phòng đôi   ☐ khác ..........; số phòng: ..........; ngày nhận phòng: ....................'),
    NUM('3.', 'Dịch vụ bao gồm: ☐ chăm sóc sinh hoạt hằng ngày  ☐ theo dõi sức khỏe, điều dưỡng  ☐ vật lý trị liệu, phục hồi chức năng  ☐ ăn uống theo chế độ  ☐ hoạt động văn hóa, giải trí  ☐ khác: ..........'),
    ARTV(2, 'Thời hạn'),
    NUM('', 'Từ ngày .................... đến ngày ....................  ☐ Tự động gia hạn theo từng ........ tháng nếu không bên nào thông báo chấm dứt.'),
    ARTV(3, 'Phí dịch vụ và thanh toán'),
    kv([['Phí dịch vụ', '........................ VNĐ / tháng (chưa / đã gồm VAT)'], ['Tiền đặt cọc', '........................ VNĐ – hoàn trả theo Điều 7'], ['Chi phí phát sinh', 'Thuốc, vật tư y tế, khám chữa bệnh, dịch vụ ngoài gói: theo thực tế / bảng giá'], ['Kỳ thanh toán', 'Trước ngày ........ hằng tháng, bằng chuyển khoản vào tài khoản: ..........................................']]),
    ARTV(4, 'Quyền và nghĩa vụ của Bên A'),
    NUM('1.', 'Cung cấp dịch vụ đúng gói đã chọn, bảo đảm an toàn, vệ sinh, tôn trọng phẩm giá và quyền riêng tư của người cao tuổi.'),
    NUM('2.', 'Thông báo kịp thời cho Bên B về tình trạng sức khỏe, sự cố hoặc thay đổi bất thường; sơ cứu và liên hệ cơ sở y tế khi cần.'),
    NUM('3.', 'Bảo mật thông tin cá nhân, sức khỏe của người được chăm sóc và gia đình.'),
    ARTV(5, 'Quyền và nghĩa vụ của Bên B'),
    NUM('1.', 'Cung cấp trung thực thông tin sức khỏe, bệnh sử, thuốc đang dùng; cập nhật khi có thay đổi.'),
    NUM('2.', 'Thanh toán đầy đủ, đúng hạn; tuân thủ nội quy Trung tâm (giờ thăm, an toàn, vệ sinh).'),
    NUM('3.', 'Được thông tin về dịch vụ, tình trạng chăm sóc; góp ý, khiếu nại theo quy trình của Trung tâm.'),
    ARTV(6, 'Y tế, cấp cứu và tài sản cá nhân'),
    NUM('1.', 'Trường hợp khẩn cấp, Bên A được quyền sơ cứu và chuyển người được chăm sóc đến cơ sở y tế: ....................................; đồng thời báo ngay cho người liên hệ khẩn cấp. Chi phí y tế do Bên B chi trả.'),
    NUM('2.', 'Tài sản giá trị nên gửi Bên A quản lý có biên bản; Bên A không chịu trách nhiệm với tài sản không gửi.'),
    ARTV(7, 'Chấm dứt hợp đồng'),
    NUM('', 'Mỗi bên có thể chấm dứt hợp đồng khi báo trước ........ ngày bằng văn bản. Tiền đặt cọc được hoàn trả sau khi trừ các khoản còn nợ, trong vòng ........ ngày. Trường hợp người được chăm sóc qua đời, hợp đồng chấm dứt; các bên thanh toán theo thực tế.'),
    ARTV(8, 'Điều khoản chung'),
    NUM('', 'Tranh chấp được giải quyết bằng thương lượng, hòa giải; nếu không thành, đưa ra Tòa án có thẩm quyền. Hợp đồng lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01 bản; có hiệu lực từ ngày ký.', true),
    gap(200, true),
    sigN([['BÊN B', '(Ký, ghi rõ họ tên)'], ['BÊN A', '(Ký, đóng dấu)', CO.rep]]),
    new Paragraph({ pageBreakBefore: true, children: [] }),
    ...TITLE1('PHỤ LỤC 01 – DANH MỤC DỊCH VỤ & BẢNG GIÁ', 'Kèm theo Hợp đồng dịch vụ số .......... /HĐDV-VLS'),
    grid(['STT', 'Dịch vụ', 'Đơn vị', 'Đơn giá (VNĐ)', 'Ghi chú'], [700, 4200, 1300, 1800, W - 8000], 10),
  ]);
}

// ---------- 6.2 Phiếu tiếp nhận – đánh giá ban đầu ----------
function phieuTiepNhan() {
  return doc('Phiếu tiếp nhận – đánh giá ban đầu', [
    ...TITLE1('PHIẾU TIẾP NHẬN – ĐÁNH GIÁ BAN ĐẦU', 'Mã hồ sơ: ..................   Ngày tiếp nhận: ...... / ...... / ........'),
    SEC('1. Thông tin người cao tuổi'),
    kv([['Họ và tên', ''], ['Ngày sinh / Giới tính', ''], ['Số CCCD / BHYT', ''], ['Phòng / Giường', ''], ['Tôn giáo / thói quen sinh hoạt', '']]),
    SEC('2. Người liên hệ'),
    grid(['', 'Họ tên', 'Quan hệ', 'Điện thoại'], [1700, 3400, 1800, W - 6900], 2, [['Liên hệ chính'], ['Liên hệ khẩn cấp']]),
    SEC('3. Tình trạng sức khỏe'),
    kv([['Bệnh lý / tiền sử', ''], ['Dị ứng (thuốc, thức ăn)', '☐ Không   ☐ Có: ........................................'], ['Bác sĩ / cơ sở điều trị', ''],
        ['Sinh hiệu ban đầu', 'HA: ........  Mạch: ........  Nhiệt độ: ........  SpO2: ........  Cân nặng: ........']]),
    SEC('4. Thuốc đang sử dụng'),
    grid(['STT', 'Tên thuốc', 'Liều dùng', 'Thời điểm', 'Ghi chú'], [700, 3300, 1700, 1800, W - 7500], 5),
    SEC('5. Khả năng sinh hoạt'),
    kv([['Vận động', '☐ Tự đi lại   ☐ Cần hỗ trợ   ☐ Gậy / khung   ☐ Xe lăn   ☐ Nằm tại giường'],
        ['Ăn uống', '☐ Tự ăn   ☐ Cần hỗ trợ   ☐ Ăn mềm / xay   ☐ Ăn qua sonde   Chế độ: ............'],
        ['Vệ sinh cá nhân', '☐ Tự làm   ☐ Cần hỗ trợ một phần   ☐ Hỗ trợ hoàn toàn   ☐ Tã'],
        ['Nhận thức, giao tiếp', '☐ Tỉnh táo   ☐ Hay quên   ☐ Sa sút trí tuệ   Nghe / nhìn: ............'],
        ['Giấc ngủ', ''], ['Nguy cơ té ngã', '☐ Thấp   ☐ Trung bình   ☐ Cao'], ['Sở thích, mong muốn', '']]),
    SEC('6. Kế hoạch chăm sóc ban đầu'),
    P([tab()], { tabs: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 160 }),
    P([tab()], { tabs: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 160 }),
    P([tab()], { tabs: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 200, kn: true }),
    sigN([['NGƯỜI NHÀ / NGƯỜI ĐẠI DIỆN'], ['ĐIỀU DƯỠNG ĐÁNH GIÁ'], ['QUẢN LÝ TRUNG TÂM']]),
  ]);
}

// ---------- 6.3 Biên bản sự cố ----------
function suCo() {
  return doc('Biên bản sự cố', [
    docHead('BBSC-VLS'), P([], { af: 80 }),
    ...TITLE1('BIÊN BẢN GHI NHẬN SỰ CỐ'),
    kv([['Thời gian xảy ra', '........ giờ ........ ngày ...... / ...... / ........'], ['Địa điểm', ''], ['Người cao tuổi liên quan', 'Họ tên: ..........................   Phòng: ..........'],
        ['Nhân viên có mặt / phát hiện', ''], ['Loại sự cố', '☐ Té ngã   ☐ Sai sót thuốc   ☐ Chấn thương   ☐ Đi lạc   ☐ Sức khỏe bất thường   ☐ Mất / hư tài sản   ☐ Khác: ..........']]),
    SEC('1. Mô tả sự việc'),
    ...[1, 2, 3].map(() => P([tab()], { tabs: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 160 })),
    SEC('2. Xử lý ban đầu'),
    ...[1, 2].map(() => P([tab()], { tabs: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 160 })),
    kv([['Tình trạng sau xử lý', ''], ['Chuyển cơ sở y tế', '☐ Không   ☐ Có: ........................  lúc ........ giờ'], ['Đã báo gia đình', '☐ Có – người nhận tin: ..........................  lúc ........ giờ'], ['Đã báo quản lý', '☐ Có – ..........................  lúc ........ giờ']]),
    SEC('3. Nguyên nhân và biện pháp phòng ngừa'),
    ...[1, 2, 3].map(() => P([tab()], { tabs: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }], af: 160 })),
    gap(80, true),
    sigN([['NGƯỜI LẬP BIÊN BẢN'], ['NGƯỜI CHỨNG KIẾN'], ['QUẢN LÝ TRUNG TÂM']]),
  ]);
}

// ---------- 6.4 Giấy xác nhận công tác (song ngữ) ----------
function xacNhan() {
  return doc('Giấy xác nhận công tác', [
    docHead('XN-VLS'), P([], { af: 80 }),
    ...TITLE('GIẤY XÁC NHẬN CÔNG TÁC', 'CERTIFICATE OF EMPLOYMENT'),
    VI(`${CO.vi} xác nhận:`, { af: 0 }), EN(`${CO.en} hereby certifies that:`),
    fill([['Ông/Bà', 'Mr./Ms.']]),
    fill([['Ngày sinh', 'Date of birth'], ['Số CCCD / Hộ chiếu', 'ID / Passport']]),
    fill([['Chức danh', 'Position'], ['Bộ phận', 'Department']]),
    fill([['Làm việc tại Công ty từ ngày', 'Employed since']]),
    fill([['Loại hợp đồng', 'Contract type']]),
    fill([['Thu nhập bình quân (nếu cần)', 'Average income (if required)']]),
    VI('Hiện Ông/Bà đang làm việc tại Công ty. Giấy xác nhận được cấp theo đề nghị của Ông/Bà để: ........................................................', { af: 0, bf: 80 }),
    EN('He/She is currently employed by the Company. This certificate is issued at his/her request for: ........................................................', { af: 300 }),
    sigN([['', ' ', ' '], ['GIÁM ĐỐC / DIRECTOR', '(Ký, đóng dấu / Signature, seal)', CO.rep]]),
  ]);
}

// ---------- 6.5 Thông báo nội bộ ----------
function thongBao() {
  return doc('Thông báo nội bộ', [
    docHead('TB-VLS'), P([], { af: 80 }),
    ...TITLE1('THÔNG BÁO', 'Về việc ........................................................'),
    P([t('Kính gửi: ', { b: true }), t('Toàn thể cán bộ, nhân viên Viora Living Saigon – Cơ sở Lái Thiêu')], { al: AlignmentType.CENTER, af: 240 }),
    TXT('[Nội dung thông báo]', { i: true, c: GREY }),
    kv([['Nội dung', ''], ['Thời gian áp dụng', ''], ['Đối tượng / bộ phận', ''], ['Đầu mối liên hệ', '']]),
    gap(100),
    TXT('Đề nghị các bộ phận phổ biến đến nhân viên và thực hiện nghiêm túc./.', { af: 300, kn: true }),
    signBlock(['Các bộ phận;', 'Bảng tin nội bộ;', 'Lưu: VT, HC-NS.']),
  ]);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'Hop_dong_lao_dong_song_ngu_Viora.docx'), await Packer.toBuffer(contract()));
  fs.writeFileSync(path.join(OUT, 'Thu_moi_nhan_viec_song_ngu_Viora.docx'), await Packer.toBuffer(offer()));
  fs.writeFileSync(path.join(OUT, 'Quyet_dinh_thoi_viec_song_ngu_Viora.docx'), await Packer.toBuffer(decision()));
  const CHUNG = path.join(ROOT, 'hanh-chinh-van-hanh/van-ban-chung');
  fs.mkdirSync(CHUNG, { recursive: true });
  fs.writeFileSync(path.join(CHUNG, 'Giay_tieu_de_Viora.docx'), await Packer.toBuffer(blankLetterhead()));
  fs.writeFileSync(path.join(CHUNG, 'Mau_cong_van_Viora.docx'), await Packer.toBuffer(congVan()));
  fs.writeFileSync(path.join(CHUNG, 'Mau_quyet_dinh_Viora.docx'), await Packer.toBuffer(quyetDinh()));
  const VH = path.join(ROOT, 'hanh-chinh-van-hanh/van-hanh');
  fs.mkdirSync(VH, { recursive: true });
  const out = [
    [OUT, 'Thoa_thuan_dao_tao_Nhat_Ban_song_ngu_Viora.docx', daoTaoNhat()],
    [OUT, 'Cam_ket_bao_mat_thong_tin_song_ngu_Viora.docx', baoMat()],
    [OUT, 'Hop_dong_dich_vu_cong_tac_song_ngu_Viora.docx', congTac()],
    [OUT, 'Quyet_dinh_tiep_nhan_nhan_su_Viora.docx', qdNhanSu('tiep-nhan')],
    [OUT, 'Quyet_dinh_bo_nhiem_Viora.docx', qdNhanSu('bo-nhiem')],
    [OUT, 'Bien_ban_ban_giao_Viora.docx', banGiao()],
    [OUT, 'Thong_bao_ket_qua_thu_viec_Viora.docx', thuViec()],
    [OUT, 'Phu_luc_hop_dong_lao_dong_Viora.docx', phuLuc()],
    [OUT, 'Don_xin_nghi_phep_Viora.docx', donNghi('phep')],
    [OUT, 'Don_xin_nghi_viec_Viora.docx', donNghi('viec')],
    [VH, 'Hop_dong_dich_vu_cham_soc_Viora.docx', hdDichVu()],
    [VH, 'Phieu_tiep_nhan_danh_gia_ban_dau_Viora.docx', phieuTiepNhan()],
    [VH, 'Bien_ban_su_co_Viora.docx', suCo()],
    [VH, 'Giay_xac_nhan_cong_tac_song_ngu_Viora.docx', xacNhan()],
    [VH, 'Thong_bao_noi_bo_Viora.docx', thongBao()],
  ];
  for (const [dir, name, d] of out) fs.writeFileSync(path.join(dir, name), await Packer.toBuffer(d));
  console.log('ok', out.length + 6);
})();
