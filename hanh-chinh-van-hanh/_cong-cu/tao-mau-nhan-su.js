// Tạo lại 2 mẫu Word (HĐLĐ + Thư mời nhận việc) song ngữ, giấy tiêu đề Viora.
// Chạy: node hanh-chinh-van-hanh/_cong-cu/tao-mau-nhan-su.js  (cần thư viện npm "docx")
const fs = require('fs');
const path = require('path');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, Header, Footer, PageNumber, ShadingType, VerticalAlign, TableLayoutType } = D;

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'hanh-chinh-van-hanh/nhan-su');
const wordmark = fs.readFileSync(path.join(ROOT, 'public/brand/wordmark.png'));

const CO = {
  vi: 'CÔNG TY CỔ PHẦN VIORA LIVING SAIGON',
  en: 'VIORA LIVING SAIGON CORPORATION',
  mst: '3703493386',
  addrVi: 'A147F Khu phố Bình Đức 2, Phường Lái Thiêu, Thành phố Hồ Chí Minh, Việt Nam',
  addrEn: 'A147F Binh Duc 2 Quarter, Lai Thieu Ward, Ho Chi Minh City, Vietnam',
  phone: '0868 120 165', email: 'contact@vioraliving.com.vn',
  rep: 'NGUYỄN THẾ VŨ', repTitleVi: 'Giám đốc', repTitleEn: 'Director',
  hrPhone: '0708 2999 07', hrEmail: 'hr@vioraliving.com.vn',
  site: 'Viora Living Saigon – Cơ sở Lái Thiêu, Khu phố Bình Đức 2, Phường Lái Thiêu, TP.HCM',
  siteEn: 'Viora Living Saigon – Lai Thieu Campus, Binh Duc 2 Quarter, Lai Thieu Ward, Ho Chi Minh City',
};
const TEAL = '127884', DARK = '0B5560', GOLD = 'B07A12', GREY = '5D6A6C';
const FONT = 'Times New Roman';
const W = 9638; // A4 content width (DXA) with 2cm margins
const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NOBORDERS = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

const r = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size ?? 22, bold: o.bold, italics: o.italics, color: o.color, allCaps: o.caps });
const p = (runs, o = {}) => new Paragraph({ children: Array.isArray(runs) ? runs : [runs], alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 80, line: o.line ?? 276 }, indent: o.indent, keepNext: o.keepNext, border: o.border });
const vi = (t, o = {}) => p(r(t, { bold: o.bold, size: o.size }), o);
const en = (t, o = {}) => p(r(t, { italics: true, color: GREY, bold: o.bold, size: (o.size ?? 22) - 1 }), o);

// ---------- Letterhead ----------
function letterhead() {
  const cell = (children, w, align) => new TableCell({ children, width: { size: w, type: WidthType.DXA }, borders: NOBORDERS, verticalAlign: VerticalAlign.CENTER });
  const right = [
    p(r(CO.vi, { bold: true, size: 18, color: DARK }), { align: AlignmentType.RIGHT, after: 0 }),
    p(r(CO.en, { size: 16, color: GREY }), { align: AlignmentType.RIGHT, after: 0 }),
    p(r(`MSDN / Enterprise Code: ${CO.mst}`, { size: 15, color: GREY }), { align: AlignmentType.RIGHT, after: 0 }),
    p(r(CO.addrVi, { size: 15, color: GREY }), { align: AlignmentType.RIGHT, after: 0 }),
    p(r(`ĐT/Tel: ${CO.phone}  ·  ${CO.email}`, { size: 15, color: GREY }), { align: AlignmentType.RIGHT, after: 0 }),
  ];
  const t = new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [3400, W - 3400], borders: NOBORDERS, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: [
      cell([new Paragraph({ children: [new ImageRun({ type: 'png', data: wordmark, transformation: { width: 200, height: 40 } })] })], 3400),
      cell(right, W - 3400),
    ] })],
  });
  return new Header({ children: [t, new Paragraph({ spacing: { before: 60, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 1 } }, children: [] })] });
}
function footer() {
  return new Footer({ children: [
    new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 6, color: 'D9A02A', space: 4 } }, alignment: AlignmentType.CENTER, spacing: { after: 0 },
      children: [r('Where Aging Becomes Living', { italics: true, size: 16, color: TEAL }), r(`   ·   Hotline ${CO.hrPhone}   ·   ${CO.hrEmail}   ·   Trang/Page `, { size: 16, color: GREY }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: GREY }), r(' / ', { size: 16, color: GREY }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: GREY })] }),
  ] });
}
const section = children => ({
  properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 2100, bottom: 1300, left: 1134, right: 1134, header: 500, footer: 500 } } },
  headers: { default: letterhead() }, footers: { default: footer() }, children,
});

// ---------- Bilingual 2-column table (VI | EN) ----------
const HALF = Math.floor(W / 2);
const bcell = (paras, w, shade) => new TableCell({ children: paras, width: { size: w, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 110, right: 110 },
  shading: shade ? { type: ShadingType.CLEAR, color: 'auto', fill: shade } : undefined,
  borders: { top: NB, bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E7E0D5' }, left: NB, right: NB } });
// rows: [ [viParas], [enParas], shade? ]
function bitable(rows) {
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [HALF, W - HALF], layout: TableLayoutType.FIXED,
    borders: NOBORDERS,
    rows: rows.map(([a, b, s]) => new TableRow({ cantSplit: true, children: [bcell(a, HALF, s), bcell(b, W - HALF, s)] })) });
}
// helpers for rows
const H = (v, e) => [[vi(v, { bold: true, after: 0 })], [en(e, { bold: true, after: 0 })], 'E2F2F2'];
const L = (vs, es) => [vs.map(t => vi(t)), es.map(t => en(t))];

// ---------- 1) HỢP ĐỒNG LAO ĐỘNG ----------
function contract() {
  const top = [
    p(r('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { bold: true, size: 24 }), { align: AlignmentType.CENTER, after: 0 }),
    p(r('Độc lập – Tự do – Hạnh phúc', { bold: true, size: 23 }), { align: AlignmentType.CENTER, after: 0 }),
    p(r('SOCIALIST REPUBLIC OF VIETNAM', { italics: true, size: 20, color: GREY }), { align: AlignmentType.CENTER, after: 0 }),
    p(r('Independence – Freedom – Happiness', { italics: true, size: 20, color: GREY }), { align: AlignmentType.CENTER, after: 0 }),
    p(r('———————', { color: GREY }), { align: AlignmentType.CENTER, after: 160 }),
    p(r('HỢP ĐỒNG LAO ĐỘNG', { bold: true, size: 32, color: DARK }), { align: AlignmentType.CENTER, after: 0 }),
    p(r('LABOUR CONTRACT', { bold: true, italics: true, size: 26, color: GREY }), { align: AlignmentType.CENTER, after: 60 }),
    p(r('Số / No.: [..........]/HĐLĐ-VLS', { size: 22 }), { align: AlignmentType.CENTER, after: 200 }),
  ];
  const rows = [
    L(['Căn cứ Bộ luật Lao động số 45/2019/QH14 ngày 20 tháng 11 năm 2019 và các văn bản hướng dẫn thi hành;',
       'Căn cứ nhu cầu và năng lực của hai bên.',
       'Hôm nay, ngày [....] tháng [....] năm [........], tại [Địa điểm ký], chúng tôi gồm:'],
      ['Pursuant to the Labour Code No. 45/2019/QH14 dated 20 November 2019 and its guiding documents;',
       'Based on the needs and capabilities of both parties.',
       'Today, [date], at [place of signing], we are:']),
    H('BÊN A – NGƯỜI SỬ DỤNG LAO ĐỘNG', 'PARTY A – THE EMPLOYER'),
    L([`Tên công ty: ${CO.vi}`, `Mã số doanh nghiệp: ${CO.mst}`, `Địa chỉ trụ sở: ${CO.addrVi}`, `Điện thoại: ${CO.phone}  –  Email: ${CO.email}`,
       `Người đại diện: Ông ${CO.rep}  –  Chức vụ: ${CO.repTitleVi}`, '(hoặc người được ủy quyền: [Họ tên], Giấy ủy quyền số [....] ngày [....])'],
      [`Company name: ${CO.en}`, `Enterprise code: ${CO.mst}`, `Head office: ${CO.addrEn}`, `Tel: ${CO.phone}  –  Email: ${CO.email}`,
       `Represented by: Mr. ${CO.rep}  –  Position: ${CO.repTitleEn}`, '(or authorised person: [Full name], Power of Attorney No. [....] dated [....])']),
    H('BÊN B – NGƯỜI LAO ĐỘNG', 'PARTY B – THE EMPLOYEE'),
    L(['Họ và tên: [....................................]', 'Ngày sinh: [..../..../........]   Giới tính: [........]', 'Quốc tịch: [........]',
       'Số CCCD/Hộ chiếu: [............]  cấp ngày [........]  tại [........]', 'Nơi cư trú: [...............................................]',
       'Điện thoại: [............]   Email: [............]', 'Tài khoản ngân hàng: [số tài khoản] – [tên ngân hàng]'],
      ['Full name: [....................................]', 'Date of birth: [..../..../........]   Gender: [........]', 'Nationality: [........]',
       'ID/Passport No.: [............]  issued on [........]  at [........]', 'Place of residence: [...............................................]',
       'Phone: [............]   Email: [............]', 'Bank account: [account number] – [bank name]']),
    L(['Hai bên thỏa thuận ký kết hợp đồng lao động với các điều khoản sau:'], ['The two parties agree to enter into this labour contract on the following terms:']),

    H('Điều 1. Loại hợp đồng, công việc và địa điểm làm việc', 'Article 1. Contract type, job and place of work'),
    L(['1. Loại hợp đồng:', '☐ Xác định thời hạn [....] tháng, từ ngày [........] đến ngày [........]', '☐ Không xác định thời hạn, từ ngày [........]',
       '2. Thời gian thử việc (nếu có): [....] ngày, từ ngày [........] đến ngày [........]; mức lương thử việc: [....] VNĐ (không thấp hơn 85% mức lương của công việc đó).'],
      ['1. Contract type:', '☐ Definite term of [....] months, from [........] to [........]', '☐ Indefinite term, from [........]',
       '2. Probation (if any): [....] days, from [........] to [........]; probation salary: VND [....] (not less than 85% of the salary for the job).']),
    L(['3. Chức danh / vị trí: [Điều dưỡng / Nhân viên chăm sóc người cao tuổi / Kỹ thuật viên Vật lý trị liệu, Phục hồi chức năng]',
       '4. Bộ phận: [........]   Quản lý trực tiếp: [........]',
       '5. Hình thức: ☐ Toàn thời gian   ☐ Bán thời gian / cộng tác',
       '6. Nhiệm vụ: theo Bản mô tả công việc (Phụ lục 01) và phân công hợp lý của người quản lý.',
       `7. Địa điểm làm việc: ${CO.site}.`],
      ['3. Job title / position: [Nurse / Elderly Caregiver / Physiotherapy & Rehabilitation Technician]',
       '4. Department: [........]   Direct manager: [........]',
       '5. Type: ☐ Full-time   ☐ Part-time / collaborator',
       '6. Duties: as set out in the Job Description (Appendix 01) and reasonable assignments by the manager.',
       `7. Place of work: ${CO.siteEn}.`]),

    H('Điều 2. Thời giờ làm việc, thời giờ nghỉ ngơi', 'Article 2. Working hours and rest periods'),
    L(['1. Làm việc theo ca: [....] giờ/ngày, [....] giờ/tuần; lịch ca do Bên A bố trí và thông báo trước [....] ngày.',
       '2. Nghỉ trong ca, nghỉ hằng tuần: [........].',
       '3. Nghỉ lễ, Tết, nghỉ hằng năm ([....] ngày/năm), nghỉ việc riêng và các chế độ nghỉ khác theo Bộ luật Lao động và nội quy của Bên A.',
       '4. Làm thêm giờ chỉ khi có sự đồng ý của Bên B và được trả lương theo quy định của pháp luật.'],
      ['1. Shift work: [....] hours/day, [....] hours/week; the roster is arranged by Party A and notified [....] days in advance.',
       '2. Breaks during shifts and weekly rest: [........].',
       '3. Public holidays, Tet, annual leave ([....] days/year), personal leave and other leave in accordance with the Labour Code and Party A’s internal rules.',
       '4. Overtime only with Party B’s consent and paid in accordance with the law.']),

    H('Điều 3. Tiền lương, phụ cấp và phúc lợi', 'Article 3. Salary, allowances and benefits'),
    L(['1. Mức lương: [....................] VNĐ/[tháng/giờ].', '2. Phụ cấp: [loại phụ cấp – mức]. Các khoản bổ sung khác: [........].',
       '3. Hình thức trả lương: chuyển khoản vào tài khoản của Bên B. Kỳ trả lương: ngày [....] hằng tháng.',
       '4. Chế độ nâng lương, thưởng: theo quy chế lương, thưởng của Bên A.',
       '5. Bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp: theo quy định của pháp luật.'],
      ['1. Salary: VND [....................] per [month/hour].', '2. Allowances: [type – amount]. Other supplements: [........].',
       '3. Payment method: bank transfer to Party B’s account. Pay day: the [....] of each month.',
       '4. Salary review and bonuses: in accordance with Party A’s salary and bonus policy.',
       '5. Social, health and unemployment insurance: in accordance with the law.']),
    L(['6. Đào tạo: Bên B được tham gia đào tạo về quy trình chăm sóc người cao tuổi. Bên B có thể được xét cử tham gia chương trình đào tạo chuyên môn tại Nhật Bản; chi phí ăn ở, đi lại do Bên A chi trả. Điều kiện tham gia và cam kết sau đào tạo (nếu có) được quy định trong thỏa thuận đào tạo riêng.',
       '7. Chỗ lưu trú tại Trung tâm: ☐ Có nhu cầu   ☐ Không có nhu cầu. Điều kiện sử dụng: [........].',
       '8. Đồng phục, dụng cụ và trang thiết bị bảo hộ lao động: Bên A cấp theo yêu cầu công việc.'],
      ['6. Training: Party B will be trained in elderly-care procedures. Party B may be selected for a professional training programme in Japan; accommodation, meals and travel costs are borne by Party A. Eligibility and post-training commitments (if any) are set out in a separate training agreement.',
       '7. On-site accommodation: ☐ Required   ☐ Not required. Terms of use: [........].',
       '8. Uniforms, tools and personal protective equipment: provided by Party A as required by the job.']),

    H('Điều 4. Quyền và nghĩa vụ của Bên B', 'Article 4. Rights and obligations of Party B'),
    L(['1. Được hưởng lương, phụ cấp, phúc lợi, đào tạo và các quyền khác theo hợp đồng này và pháp luật.',
       '2. Thực hiện công việc theo hợp đồng; tuân thủ nội quy lao động, quy trình chuyên môn, an toàn – vệ sinh lao động và sự điều hành hợp pháp của Bên A.',
       '3. Tôn trọng phẩm giá, quyền riêng tư và an toàn của người cao tuổi; bảo mật thông tin sức khỏe, thông tin cá nhân của người cao tuổi, gia đình họ và thông tin nội bộ của Bên A, kể cả sau khi chấm dứt hợp đồng.',
       '4. Bồi thường thiệt hại do lỗi của mình gây ra theo nội quy và quy định của pháp luật.'],
      ['1. To receive salary, allowances, benefits, training and other entitlements under this contract and the law.',
       '2. To perform the work under this contract; to comply with the internal labour rules, professional procedures, occupational safety and hygiene, and Party A’s lawful instructions.',
       '3. To respect the dignity, privacy and safety of residents; to keep confidential the health and personal information of residents and their families, and Party A’s internal information, including after the contract ends.',
       '4. To compensate for damage caused by their fault in accordance with the internal rules and the law.']),

    H('Điều 5. Quyền và nghĩa vụ của Bên A', 'Article 5. Rights and obligations of Party A'),
    L(['1. Bảo đảm việc làm, điều kiện làm việc an toàn và thực hiện đầy đủ các cam kết trong hợp đồng.',
       '2. Trả lương đầy đủ, đúng hạn; đóng bảo hiểm cho Bên B theo quy định của pháp luật.',
       '3. Điều hành, phân công công việc; khen thưởng và xử lý kỷ luật lao động theo nội quy và quy định của pháp luật.'],
      ['1. To provide work and safe working conditions and to fully perform its commitments under this contract.',
       '2. To pay salary in full and on time; to pay insurance contributions for Party B in accordance with the law.',
       '3. To manage and assign work; to reward and discipline in accordance with the internal rules and the law.']),

    H('Điều 6. Chấm dứt hợp đồng', 'Article 6. Termination'),
    L(['Hợp đồng chấm dứt trong các trường hợp và theo thủ tục, thời hạn báo trước quy định tại Bộ luật Lao động. Khi chấm dứt, hai bên thanh toán đầy đủ các khoản liên quan theo quy định của pháp luật.'],
      ['This contract terminates in the cases and in accordance with the procedures and notice periods set out in the Labour Code. Upon termination, both parties shall settle all related payments in accordance with the law.']),

    H('Điều 7. Bảo vệ dữ liệu cá nhân', 'Article 7. Personal data protection'),
    L(['Bên B đồng ý để Bên A xử lý dữ liệu cá nhân của Bên B cho mục đích quản lý nhân sự, trả lương, bảo hiểm, thuế và các nghĩa vụ theo quy định của pháp luật.'],
      ['Party B consents to Party A processing Party B’s personal data for human resource management, payroll, insurance, tax and other legal obligations.']),

    H('Điều 8. Điều khoản thi hành', 'Article 8. Implementation'),
    L(['1. Những vấn đề không ghi trong hợp đồng này được thực hiện theo nội quy lao động, thỏa ước lao động tập thể (nếu có) và quy định của pháp luật.',
       '2. Tranh chấp được giải quyết trước hết bằng thương lượng; nếu không thành, theo thủ tục quy định của pháp luật.',
       '3. Hợp đồng lập thành 02 bản song ngữ Việt – Anh có giá trị như nhau, mỗi bên giữ 01 bản. Trường hợp có khác biệt giữa hai ngôn ngữ, bản tiếng Việt được ưu tiên áp dụng.',
       '4. Hợp đồng có hiệu lực từ ngày [........].'],
      ['1. Matters not covered by this contract are governed by the internal labour rules, the collective labour agreement (if any) and the law.',
       '2. Disputes shall first be settled by negotiation; failing that, in accordance with legal procedures.',
       '3. This contract is made in 02 bilingual Vietnamese – English originals of equal validity; each party keeps 01. In case of discrepancy, the Vietnamese version prevails.',
       '4. This contract takes effect from [........].']),
  ];
  const sig = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [HALF, W - HALF], borders: NOBORDERS, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: HALF, type: WidthType.DXA }, borders: NOBORDERS, children: [
        p(r('NGƯỜI LAO ĐỘNG', { bold: true }), { align: AlignmentType.CENTER, before: 240, after: 0 }), p(r('THE EMPLOYEE', { italics: true, color: GREY }), { align: AlignmentType.CENTER, after: 0 }),
        p(r('(Ký, ghi rõ họ tên / Signature, full name)', { italics: true, size: 18, color: GREY }), { align: AlignmentType.CENTER, after: 1400 }),
        p(r('[Họ tên người lao động]', { bold: true }), { align: AlignmentType.CENTER })] }),
      new TableCell({ width: { size: W - HALF, type: WidthType.DXA }, borders: NOBORDERS, children: [
        p(r('NGƯỜI SỬ DỤNG LAO ĐỘNG', { bold: true }), { align: AlignmentType.CENTER, before: 240, after: 0 }), p(r('THE EMPLOYER', { italics: true, color: GREY }), { align: AlignmentType.CENTER, after: 0 }),
        p(r('(Ký, đóng dấu / Signature, company seal)', { italics: true, size: 18, color: GREY }), { align: AlignmentType.CENTER, after: 1400 }),
        p(r(CO.rep, { bold: true }), { align: AlignmentType.CENTER, after: 0 }), p(r(`${CO.repTitleVi} / ${CO.repTitleEn}`, { size: 20, color: GREY }), { align: AlignmentType.CENTER })] }),
    ] })] });
  const appendix = [
    new Paragraph({ pageBreakBefore: true, alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [r('PHỤ LỤC 01 – BẢN MÔ TẢ CÔNG VIỆC', { bold: true, size: 28, color: DARK })] }),
    p(r('APPENDIX 01 – JOB DESCRIPTION', { bold: true, italics: true, size: 24, color: GREY }), { align: AlignmentType.CENTER, after: 80 }),
    p(r('(Kèm theo Hợp đồng lao động số / Attached to Labour Contract No. [..........]/HĐLĐ-VLS)', { italics: true, size: 20 }), { align: AlignmentType.CENTER, after: 200 }),
    bitable([
      L(['Chức danh: [........]', 'Người lao động: [Họ tên]'], ['Job title: [........]', 'Employee: [Full name]']),
      H('Nhiệm vụ chính', 'Main duties'),
      L(['1. [........]', '2. [........]', '3. [........]', '4. [........]', '5. [........]'], ['1. [........]', '2. [........]', '3. [........]', '4. [........]', '5. [........]']),
      H('Yêu cầu', 'Requirements'),
      L(['1. [........]', '2. [........]', '3. [........]'], ['1. [........]', '2. [........]', '3. [........]']),
    ]),
  ];
  return new Document({ creator: 'Viora Living Saigon', title: 'Hợp đồng lao động / Labour Contract',
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [section([...top, bitable(rows), p(r(''), { after: 120 }), sig, ...appendix])] });
}

// ---------- 2) THƯ MỜI NHẬN VIỆC ----------
function offer() {
  const kv = (v, e, val) => [[vi(v, { bold: true, after: 0 }), en(e, { after: 0 })], [vi(val, { after: 0 })]];
  const kvTable = rows => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [3600, W - 3600], layout: TableLayoutType.FIXED, borders: NOBORDERS,
    rows: rows.map(([a, b], i) => new TableRow({ cantSplit: true, children: [bcell(a, 3600, i % 2 ? undefined : 'F6FBFA'), bcell(b, W - 3600, i % 2 ? undefined : 'F6FBFA')] })) });
  const bullet = (v, e) => [p([r('•  ', { color: TEAL, bold: true }), r(v)], { indent: { left: 360, hanging: 240 }, after: 0 }), p(r(e, { italics: true, color: GREY, size: 21 }), { indent: { left: 360 }, after: 80 })];
  const children = [
    p([r('Số / Ref.: [..........]/TMNV-VLS', { size: 20 })], { after: 0 }),
    p([r('TP. Hồ Chí Minh, ngày [....] tháng [....] năm [........]', { size: 20, italics: true })], { align: AlignmentType.RIGHT, after: 0 }),
    p([r('Ho Chi Minh City, [date]', { size: 20, italics: true, color: GREY })], { align: AlignmentType.RIGHT, after: 240 }),
    p(r('THƯ MỜI NHẬN VIỆC', { bold: true, size: 32, color: DARK }), { align: AlignmentType.CENTER, after: 0 }),
    p(r('LETTER OF OFFER', { bold: true, italics: true, size: 26, color: GREY }), { align: AlignmentType.CENTER, after: 240 }),
    vi('Kính gửi: Anh/Chị [Họ và tên]', { bold: true, after: 0 }), en('Dear Mr./Ms. [Full name],', { after: 160 }),
    vi(`Thay mặt ${CO.vi}, chúng tôi trân trọng cảm ơn Anh/Chị đã quan tâm và tham gia quá trình tuyển dụng. Chúng tôi vui mừng thông báo Anh/Chị đã được chọn cho vị trí dưới đây, với các điều kiện như sau:`, { after: 40 }),
    en(`On behalf of ${CO.en}, thank you for your interest and for taking part in our recruitment process. We are pleased to offer you the position below on the following terms:`, { after: 160 }),
    kvTable([
      kv('Vị trí', 'Position', '[Điều dưỡng / Nhân viên chăm sóc người cao tuổi / Kỹ thuật viên Vật lý trị liệu, Phục hồi chức năng]'),
      kv('Hình thức làm việc', 'Employment type', '☐ Toàn thời gian / Full-time    ☐ Bán thời gian / cộng tác – Part-time / collaborator'),
      kv('Địa điểm làm việc', 'Place of work', `${CO.site}`),
      kv('Quản lý trực tiếp', 'Reporting to', '[Họ tên – chức danh]'),
      kv('Ngày bắt đầu làm việc', 'Start date', '[..../..../........]'),
      kv('Thời gian làm việc', 'Working hours', 'Làm việc theo ca / Shift work: [........]'),
      kv('Thời gian thử việc', 'Probation period', '[....] ngày / days'),
      kv('Lương thử việc', 'Probation salary', '[....................] VNĐ/[tháng/giờ] – VND per [month/hour]'),
      kv('Lương chính thức', 'Salary after probation', '[....................] VNĐ/[tháng/giờ] – VND per [month/hour]'),
      kv('Phụ cấp, thưởng', 'Allowances, bonuses', '[........]'),
    ]),
    p(r(''), { after: 80 }),
    vi('Quyền lợi', { bold: true, after: 0 }), en('Benefits', { bold: true, after: 80 }),
    ...bullet('Được đào tạo chuyên môn về chăm sóc người cao tuổi tại Nhật Bản; chi phí ăn ở, đi lại do Viora Living Saigon chi trả.', 'Professional elderly-care training in Japan; accommodation, meals and travel costs covered by Viora Living Saigon.'),
    ...bullet('Bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp và các chế độ phúc lợi theo quy định.', 'Social, health and unemployment insurance and other statutory benefits.'),
    ...bullet('Chỗ lưu trú tại Trung tâm cho nhân sự có nhu cầu.', 'On-site accommodation for staff who need it.'),
    ...bullet('Môi trường làm việc chuyên nghiệp, nhân văn; cơ hội phát triển nghề nghiệp lâu dài.', 'A professional, caring workplace with long-term career development.'),
    ...bullet('[Quyền lợi khác, nếu có]', '[Other benefits, if any]'),
    p(r(''), { after: 40 }),
    vi('Khi nhận việc, Anh/Chị vui lòng chuẩn bị: [danh sách giấy tờ cần nộp].', { after: 0 }),
    en('On your first day, please bring: [list of documents required].', { after: 120 }),
    vi('Thư mời này có giá trị khi Anh/Chị đáp ứng: [điều kiện kèm theo, nếu có]. Chi tiết quyền lợi và nghĩa vụ sẽ được quy định trong Hợp đồng lao động.', { after: 0 }),
    en('This offer is subject to: [conditions, if any]. Full rights and obligations will be set out in the Labour Contract.', { after: 120 }),
    vi(`Vui lòng xác nhận nhận việc trước ngày [..../..../........] bằng cách ký vào phần xác nhận bên dưới, hoặc liên hệ Phòng Nhân sự: ${CO.hrPhone} – ${CO.hrEmail}.`, { after: 0 }),
    en(`Please confirm your acceptance by [date] by signing below, or contact Human Resources: ${CO.hrPhone} – ${CO.hrEmail}.`, { after: 120 }),
    vi('Chúng tôi rất mong được chào đón Anh/Chị gia nhập đội ngũ Viora Living Saigon.', { after: 0 }),
    en('We look forward to welcoming you to the Viora Living Saigon team.', { after: 200 }),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [HALF, W - HALF], borders: NOBORDERS, layout: TableLayoutType.FIXED, rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: HALF, type: WidthType.DXA }, borders: NOBORDERS, children: [p(r(''))] }),
      new TableCell({ width: { size: W - HALF, type: WidthType.DXA }, borders: NOBORDERS, children: [
        p(r(`TM. ${CO.vi}`, { bold: true, size: 20 }), { align: AlignmentType.CENTER, after: 0 }),
        p(r(`On behalf of ${CO.en}`, { italics: true, size: 19, color: GREY }), { align: AlignmentType.CENTER, after: 1200 }),
        p(r('[Họ tên người ký]', { bold: true }), { align: AlignmentType.CENTER, after: 0 }),
        p(r('[Chức danh / Title]', { size: 20, color: GREY }), { align: AlignmentType.CENTER })] }),
    ] })] }),
    new Paragraph({ spacing: { before: 240, after: 120 }, border: { top: { style: BorderStyle.DASHED, size: 6, color: GREY, space: 6 } }, children: [] }),
    p(r('XÁC NHẬN NHẬN VIỆC / ACCEPTANCE', { bold: true, color: DARK }), { align: AlignmentType.CENTER, after: 80 }),
    vi('Tôi, [Họ và tên], đã đọc, hiểu và đồng ý nhận việc theo các điều kiện nêu trong thư mời này. Tôi sẽ bắt đầu làm việc từ ngày [..../..../........].', { after: 0 }),
    en('I, [Full name], have read, understood and accept this offer on the terms above. I will start work on [date].', { after: 160 }),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [HALF, W - HALF], borders: NOBORDERS, layout: TableLayoutType.FIXED, rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: HALF, type: WidthType.DXA }, borders: NOBORDERS, children: [vi('Ngày / Date: [..../..../........]')] }),
      new TableCell({ width: { size: W - HALF, type: WidthType.DXA }, borders: NOBORDERS, children: [
        p(r('Người nhận việc / Candidate', { bold: true }), { align: AlignmentType.CENTER, after: 0 }),
        p(r('(Ký, ghi rõ họ tên / Signature, full name)', { italics: true, size: 18, color: GREY }), { align: AlignmentType.CENTER, after: 900 })] }),
    ] })] }),
  ];
  return new Document({ creator: 'Viora Living Saigon', title: 'Thư mời nhận việc / Letter of Offer',
    styles: { default: { document: { run: { font: FONT, size: 22 } } } }, sections: [section(children)] });
}

(async () => {
  fs.writeFileSync(path.join(OUT, 'Hop_dong_lao_dong_song_ngu_Viora.docx'), await Packer.toBuffer(contract()));
  fs.writeFileSync(path.join(OUT, 'Thu_moi_nhan_viec_song_ngu_Viora.docx'), await Packer.toBuffer(offer()));
  console.log('ok');
})();
