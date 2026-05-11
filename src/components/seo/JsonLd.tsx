export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const arr = Array.isArray(data) ? data : [data];
  return (
    <>
      {arr.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(d).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
