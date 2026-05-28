/**
 * Homepage lead: prominent name (with the coral brand period), role line, and a
 * friendly invitation to filter the log below. Copy comes from Profile.
 */
export function HomeLead({
  name,
  role,
  filterIntro,
}: {
  name: string;
  role: string;
  filterIntro: string;
}) {
  return (
    <div className="px-5 pb-[34px] pt-12 md:px-11 md:pt-16">
      <h1 className="font-display text-[40px] font-bold leading-[1] tracking-[-0.035em] text-ink sm:text-[52px] md:text-[56px]">
        {name}
        <span className="text-accent">.</span>
      </h1>
      <p className="mt-[14px] text-[15px] text-muted">{role}</p>
      <p className="mt-[18px] max-w-[520px] text-[15px] leading-[1.6] text-muted">
        {filterIntro}
      </p>
    </div>
  );
}
