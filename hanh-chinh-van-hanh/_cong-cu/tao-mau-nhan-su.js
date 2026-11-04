// Tạo lại 2 mẫu Word (Hợp đồng lao động + Thư mời nhận việc) song ngữ Việt – Anh, giấy tiêu đề Viora.
// Chạy: node hanh-chinh-van-hanh/_cong-cu/tao-mau-nhan-su.js   (cần thư viện npm "docx")
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, Header, Footer, PageNumber, ShadingType, VerticalAlign, TableLayoutType, Tab, TabStopType,
} = require('docx');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'hanh-chinh-van-hanh/nhan-su');
const LOGO = fs.readFileSync(path.join(ROOT, 'public/brand/wordmark.png'));

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
const gap = (h = 120) => P([], { af: h });

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
function header() {
  const cell = (children, w, al) => new TableCell({ children, width: { size: w, type: WidthType.DXA }, borders: NONE, verticalAlign: VerticalAlign.CENTER });
  const L = 3000;
  return new Header({ children: [
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [L, W - L], borders: NONE, layout: TableLayoutType.FIXED, rows: [new TableRow({ children: [
      cell([new Paragraph({ spacing: { before: 0, after: 0 }, children: [new ImageRun({ type: 'png', data: LOGO, transformation: { width: 176, height: 35 } })] })], L),
      cell([
        P([t(CO.vi, { b: true, c: DARK, size: 17, sp: 6 })], { al: AlignmentType.RIGHT, af: 0 }),
        P([t(`MSDN ${CO.mst}   ·   ${CO.addrShort}`, { c: GREY, size: 15 })], { al: AlignmentType.RIGHT, af: 0 }),
      ], W - L),
    ] })] }),
    P([], { bf: 80, af: 0, bd: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 1 } } }),
  ] });
}
function footer() {
  return new Footer({ children: [P([
    t('Where Aging Becomes Living', { i: true, c: TEAL, size: 16 }),
    t(`     Hotline ${CO.phone}  ·  ${CO.email}  ·  ${CO.web}`, { c: GREY, size: 15 }),
    tab({ size: 15 }),
    new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 15, color: GREY }),
    t(' / ', { c: GREY, size: 15 }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 15, color: GREY }),
  ], { tabs: [{ type: TabStopType.RIGHT, position: W }], af: 0, bd: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } } })] });
}
const doc = (title, children) => new Document({
  creator: 'Viora Living Saigon', title,
  styles: { default: { document: { run: { font: FONT, size: SZ, color: INK } } } },
  sections: [{ properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 1900, bottom: 1250, left: MARGIN, right: MARGIN, header: 560, footer: 520 } } },
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

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'Hop_dong_lao_dong_song_ngu_Viora.docx'), await Packer.toBuffer(contract()));
  fs.writeFileSync(path.join(OUT, 'Thu_moi_nhan_viec_song_ngu_Viora.docx'), await Packer.toBuffer(offer()));
  console.log('ok');
})();
