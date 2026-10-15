// Chèn dữ liệu có cấu trúc schema.org (ký tự '<' được mã hoá để an toàn)
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
